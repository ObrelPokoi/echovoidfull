/**
 * Авторизация и Ритуал
 */
class AuthManager {
  constructor() {
    this.ritualToken = null;
    this.currentStep = 0;
    this.patternDrawer = null;
    this.verifyPatternDrawer = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.waitTimer = null;
  }
  
  async login(username, password) {
    const fingerprint = await DeviceFingerprint.collect();
    
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password, fingerprint })
    });
    
    const data = await res.json();
    
    if (!res.ok) throw new Error(data.error);
    
    if (data.needsRitual) {
      this.ritualToken = data.user?.ritualToken;
      return { success: true, needsRitual: true, user: data.user, step: data.ritualStep };
    }
    
    return { success: true, needsRitual: false, user: data.user };
  }
  
  async register(inviteCode, username, password) {
    const fingerprint = await DeviceFingerprint.collect();
    
    const res = await fetch('/api/auth/register/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ inviteCode, username, password, fingerprint })
    });
    
    const data = await res.json();
    
    if (!res.ok) throw new Error(data.error);
    
    this.ritualToken = data.ritual.ritualToken;
    return data;
  }
  
  async getRitualStatus() {
    const res = await fetch('/api/auth/ritual/status', {
      credentials: 'include'
    });
    const data = await res.json();
    
    if (!res.ok) throw new Error(data.error);
    
    if (data.ritualToken) this.ritualToken = data.ritualToken;
    return data;
  }
  
  async completeStep1() {
    const res = await fetch('/api/auth/ritual/step1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ritualToken: this.ritualToken })
    });
    
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data;
  }
  
  async completeStep2(pattern) {
    const res = await fetch('/api/auth/ritual/step2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ritualToken: this.ritualToken, pattern })
    });
    
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data;
  }
  
  async completeStep3(voiceData) {
    const res = await fetch('/api/auth/ritual/step3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ritualToken: this.ritualToken, voiceData })
    });
    
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data;
  }
  
  async checkStep4() {
    const res = await fetch('/api/auth/ritual/step4', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ritualToken: this.ritualToken })
    });
    
    return await res.json();
  }
  
  async completeStep5(echoPhrase, pattern) {
    const res = await fetch('/api/auth/ritual/step5', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ritualToken: this.ritualToken, echoPhrase, pattern })
    });
    
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data;
  }
  
  async logout() {
    await fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include'
    });
  }
  
  async checkSession() {
    const res = await fetch('/api/auth/me', {
      credentials: 'include'
    });
    return await res.json();
  }
  
  // === Запись голоса ===
  async startVoiceRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);
      
      this.mediaRecorder.ondataavailable = (e) => {
        this.audioChunks.push(e.data);
      };
      
      this.mediaRecorder.start();
      return true;
    } catch (err) {
      console.error('Ошибка доступа к микрофону:', err);
      return false;
    }
  }
  
  stopVoiceRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }
      
      this.mediaRecorder.onstop = async () => {
        const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const arrayBuffer = await blob.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        // Останавливаем все треки
        this.mediaRecorder.stream.getTracks().forEach(t => t.stop());
        
        resolve(base64);
      };
      
      this.mediaRecorder.stop();
    });
  }
}