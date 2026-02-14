/**
 * Чат-менеджер
 */
class ChatManager {
  constructor() {
    this.ws = null;
    this.currentRoom = null;
    this.rooms = [];
    this.contacts = [];
    this.onMessage = null;
    this.onTyping = null;
    this.onStatusChange = null;
    this.onRoomsUpdate = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.typingTimeout = null;
  }
  
  connect() {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    this.ws = new WebSocket(`${protocol}://${location.host}`);
    
    this.ws.onopen = () => {
      console.log('🌑 WebSocket connected');
      this.reconnectAttempts = 0;
      // Аутентификация
      this.authenticate();
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), delay);
      }
    };
    
    this.ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  }
  
  authenticate() {
    // Получаем token из cookie
    const token = document.cookie
      .split('; ')
      .find(c => c.startsWith('session_token='))
      ?.split('=')[1];
    
    if (token) {
      this.send({ type: 'auth', token });
    }
  }
  
  handleMessage(data) {
    switch (data.type) {
      case 'auth_success':
        console.log('🌑 Authenticated via WebSocket');
        this.loadRooms();
        break;
        
      case 'new_message':
        if (this.onMessage) this.onMessage(data.message);
        // Обновляем preview в списке чатов
        this.updateRoomPreview(data.message);
        break;
        
      case 'user_typing':
        if (this.onTyping) this.onTyping(data);
        break;
        
      case 'user_status':
        if (this.onStatusChange) this.onStatusChange(data);
        break;
        
      case 'contact_request':
        App.showToast('Новый запрос в контакты', 'info');
        this.loadContacts();
        break;
        
      case 'contact_accepted':
        App.showToast('Контакт добавлен', 'success');
        this.loadContacts();
        this.loadRooms();
        break;
        
      case 'added_to_room':
        App.showToast(`Вы добавлены в чат: ${data.roomName}`, 'info');
        this.loadRooms();
        break;
    }
  }
  
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
  
  sendMessage(roomId, content, messageType = 'text') {
  this.send({
    type: 'message',
    roomId,
    content,
    messageType
  });
}
  
  sendTyping(roomId) {
    clearTimeout(this.typingTimeout);
    this.send({ type: 'typing', roomId });
    this.typingTimeout = setTimeout(() => {}, 3000);
  }
  
  markRead(roomId) {
    this.send({ type: 'read', roomId });
  }
  
  async loadRooms() {
    try {
      const res = await fetch('/api/rooms', { credentials: 'include' });
      this.rooms = await res.json();
      if (this.onRoomsUpdate) this.onRoomsUpdate(this.rooms);
    } catch (err) {
      console.error('Load rooms error:', err);
    }
  }
  
  async loadMessages(roomId, before = null) {
    try {
      let url = `/api/rooms/${roomId}/messages?limit=50`;
      if (before) url += `&before=${before}`;
      const res = await fetch(url, { credentials: 'include' });
      return await res.json();
    } catch (err) {
      console.error('Load messages error:', err);
      return [];
    }
  }
  
  async loadContacts() {
    try {
      const res = await fetch('/api/contacts', { credentials: 'include' });
      this.contacts = await res.json();
      return this.contacts;
    } catch (err) {
      console.error('Load contacts error:', err);
      return [];
    }
  }
  
  async loadContactRequests() {
    try {
      const res = await fetch('/api/contacts/requests', { credentials: 'include' });
      return await res.json();
    } catch (err) {
      console.error('Load contact requests error:', err);
      return [];
    }
  }
  
  async searchUsers(query) {
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, { credentials: 'include' });
      return await res.json();
    } catch (err) {
      console.error('Search error:', err);
      return [];
    }
  }
  
  async addContact(contactId) {
    try {
      const res = await fetch('/api/contacts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ contactId })
      });
      return await res.json();
    } catch (err) {
      console.error('Add contact error:', err);
      return null;
    }
  }
  
  async createRoom(name, memberIds) {
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, memberIds })
      });
      const data = await res.json();
      this.loadRooms();
      return data;
    } catch (err) {
      console.error('Create room error:', err);
      return null;
    }
  }
  
  updateRoomPreview(message) {
    const room = this.rooms.find(r => r.id === message.room_id);
    if (room) {
      room.last_message = message.content;
      room.last_message_at = message.created_at;
      if (message.room_id !== this.currentRoom) {
        room.unread_count = (room.unread_count || 0) + 1;
      }
      if (this.onRoomsUpdate) this.onRoomsUpdate(this.rooms);
    }
  }
  
  disconnect() {
    if (this.ws) {
      this.maxReconnectAttempts = 0;
      this.ws.close();
    }
  }
}