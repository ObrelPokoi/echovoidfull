/**
 * Сбор отпечатка устройства
 */
class DeviceFingerprint {
  
  static async collect() {
    const fp = {};
    
    // Основные данные
    fp.screenResolution = `${screen.width}x${screen.height}`;
    fp.colorDepth = screen.colorDepth;
    fp.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    fp.language = navigator.language;
    fp.platform = navigator.platform;
    fp.hardwareConcurrency = navigator.hardwareConcurrency || 0;
    fp.deviceMemory = navigator.deviceMemory || 0;
    fp.touchSupport = 'ontouchstart' in window ? 'true' : 'false';
    fp.maxTouchPoints = navigator.maxTouchPoints || 0;
    
    // Canvas fingerprint
    fp.canvasFingerprint = this.getCanvasFingerprint();
    
    // WebGL fingerprint
    const webgl = this.getWebGLFingerprint();
    fp.webglFingerprint = webgl.fingerprint;
    fp.webglVendor = webgl.vendor;
    fp.webglRenderer = webgl.renderer;
    
    // Audio fingerprint
    fp.audioFingerprint = await this.getAudioFingerprint();
    
    // Шрифты (упрощённо)
    fp.fonts = this.detectFonts();
    
    // Plugins
    fp.plugins = this.getPlugins();
    
    return fp;
  }
  
  static getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 200;
      canvas.height = 50;
      
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('EchoVoid FP', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('EchoVoid FP', 4, 17);
      
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgb(255, 0, 255)';
      ctx.beginPath();
      ctx.arc(50, 25, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgb(0, 255, 255)';
      ctx.beginPath();
      ctx.arc(75, 25, 25, 0, Math.PI * 2);
      ctx.fill();
      
      return canvas.toDataURL();
    } catch (e) {
      return '';
    }
  }
  
  static getWebGLFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) return { fingerprint: '', vendor: '', renderer: '' };
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : '';
      const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
      
      const params = [
        gl.getParameter(gl.VERSION),
        gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        gl.getParameter(gl.MAX_TEXTURE_SIZE),
        gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
        gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
        gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
        vendor,
        renderer
      ];
      
      return {
        fingerprint: params.join('|||'),
        vendor,
        renderer
      };
    } catch (e) {
      return { fingerprint: '', vendor: '', renderer: '' };
    }
  }
  
  static async getAudioFingerprint() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return '';
      
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const analyser = context.createAnalyser();
      const gain = context.createGain();
      const processor = context.createScriptProcessor(4096, 1, 1);
      
      gain.gain.value = 0;
      oscillator.type = 'triangle';
      oscillator.frequency.value = 10000;
      
      oscillator.connect(analyser);
      analyser.connect(processor);
      processor.connect(gain);
      gain.connect(context.destination);
      
      oscillator.start(0);
      
      const dataArray = new Float32Array(analyser.frequencyBinCount);
      analyser.getFloatFrequencyData(dataArray);
      
      oscillator.stop();
      processor.disconnect();
      context.close();
      
      // Простой хеш из данных
      let hash = 0;
      for (let i = 0; i < dataArray.length; i++) {
        if (isFinite(dataArray[i])) {
          hash = ((hash << 5) - hash) + Math.round(dataArray[i] * 1000);
          hash = hash & hash;
        }
      }
      
      return hash.toString();
    } catch (e) {
      return '';
    }
  }
  
  static detectFonts() {
    const testFonts = [
      'Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Verdana',
      'Helvetica', 'Comic Sans MS', 'Impact', 'Lucida Console',
      'Tahoma', 'Trebuchet MS', 'Palatino', 'Garamond'
    ];
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 30;
    
    const detected = [];
    const testString = 'mmmmmmmmmmlli';
    const defaultWidth = ctx.measureText(testString).width;
    
    for (const font of testFonts) {
      ctx.font = `16px "${font}", monospace`;
      const width = ctx.measureText(testString).width;
      if (width !== defaultWidth) {
        detected.push(font);
      }
    }
    
    return detected.join(',');
  }
  
  static getPlugins() {
    try {
      const plugins = [];
      for (let i = 0; i < navigator.plugins.length; i++) {
        plugins.push(navigator.plugins[i].name);
      }
      return plugins.join(',');
    } catch (e) {
      return '';
    }
  }
}