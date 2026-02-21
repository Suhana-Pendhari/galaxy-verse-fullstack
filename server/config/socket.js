const socketIO = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Join user to their personal room
    socket.on('join-user-room', (userId) => {
      socket.join(`user-${userId}`);
    });

    // Mission room handling
    socket.on('join-mission', (missionId) => {
      socket.join(`mission-${missionId}`);
      console.log(`Socket ${socket.id} joined mission ${missionId}`);
    });

    socket.on('leave-mission', (missionId) => {
      socket.leave(`mission-${missionId}`);
      console.log(`Socket ${socket.id} left mission ${missionId}`);
    });

    // Live comments for missions
    socket.on('mission-comment', (data) => {
      io.to(`mission-${data.missionId}`).emit('new-comment', data);
    });

    // Real-time notifications
    socket.on('send-notification', (data) => {
      io.to(`user-${data.userId}`).emit('notification', data);
    });

    // Quiz room handling
    socket.on('join-quiz', (quizId) => {
      socket.join(`quiz-${quizId}`);
    });

    socket.on('quiz-answer', (data) => {
      io.to(`quiz-${data.quizId}`).emit('answer-submitted', data);
    });

    // Solar system collaborative viewing
    socket.on('sync-solar-view', (data) => {
      socket.broadcast.emit('view-synced', data);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO };
