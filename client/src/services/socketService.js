import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Connect to socket server
  connect(token) {
    if (this.socket?.connected) return;

    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupEventListeners();
  }

  // Setup default event listeners
  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
      this.emit('reconnect-success');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected, don't reconnect
        this.disconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.emit('reconnect-failed');
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  // Emit event
  emit(event, data) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected. Message queued:', event);
      setTimeout(() => this.emit(event, data), 1000);
      return;
    }
    this.socket.emit(event, data);
  }

  // On event
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    this.socket?.on(event, callback);
  }

  // Off event
  off(event, callback) {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
      this.socket?.off(event, callback);
    } else {
      this.listeners.delete(event);
      this.socket?.off(event);
    }
  }

  // Join room
  joinRoom(room) {
    this.emit('join-room', room);
  }

  // Leave room
  leaveRoom(room) {
    this.emit('leave-room', room);
  }

  // Join mission room
  joinMission(missionId) {
    this.emit('join-mission', missionId);
  }

  // Leave mission room
  leaveMission(missionId) {
    this.emit('leave-mission', missionId);
  }

  // Join quiz room
  joinQuiz(quizId) {
    this.emit('join-quiz', quizId);
  }

  // Leave quiz room
  leaveQuiz(quizId) {
    this.emit('leave-quiz', quizId);
  }

  // Send mission comment
  sendMissionComment(missionId, comment) {
    this.emit('mission-comment', { missionId, comment });
  }

  // Send quiz answer
  sendQuizAnswer(quizId, questionId, answer) {
    this.emit('quiz-answer', { quizId, questionId, answer });
  }

  // Sync solar system view
  syncSolarView(viewData) {
    this.emit('sync-solar-view', viewData);
  }

  // Send notification
  sendNotification(userId, notification) {
    this.emit('send-notification', { userId, notification });
  }

  // Check connection status
  isConnected() {
    return this.socket?.connected || false;
  }

  // Get socket ID
  getSocketId() {
    return this.socket?.id;
  }

  // Reconnect manually
  reconnect() {
    if (this.socket) {
      this.socket.connect();
    }
  }

  // Remove all listeners
  removeAllListeners() {
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.off(event, callback);
      });
    });
    this.listeners.clear();
  }
}

export default new SocketService();
