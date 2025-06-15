const { Server } = require('socket.io');
let io;

function initChat(server) {
  io = new Server(server, { cors: { origin: '*' } });
  io.on('connection', socket => {
    socket.on('joinInvoice', id => socket.join(`invoice-${id}`));
  });
}

function broadcastMessage(invoiceId, message) {
  if (io) {
    io.to(`invoice-${invoiceId}`).emit('chatMessage', message);
  }
}

module.exports = { initChat, broadcastMessage };
