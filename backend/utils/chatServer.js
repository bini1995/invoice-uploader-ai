const { Server } = require('socket.io');
let io;

function initChat(server) {
  io = new Server(server, { cors: { origin: '*' } });
  io.on('connection', (socket) => {
    socket.on('joinInvoice', (id) => socket.join(`invoice-${id}`));
  });
}

function broadcastMessage(invoiceId, message) {
  if (io) {
    io.to(`invoice-${invoiceId}`).emit('chatMessage', message);
  }
}

function broadcastNotification(message) {
  if (io) {
    io.emit('notification', { text: message });
  }
}

function broadcastActivity(log) {
  if (io) {
    io.emit('activity', log);
  }
}

module.exports = { initChat, broadcastMessage, broadcastNotification, broadcastActivity };
