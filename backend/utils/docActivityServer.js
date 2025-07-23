const { WebSocketServer } = require('ws');
const { parse } = require('url');
let wss;

function initDocActivity(server) {
  wss = new WebSocketServer({ noServer: true });
  server.on('upgrade', (request, socket, head) => {
    const { pathname } = parse(request.url);
    if (pathname === '/ws/doc-activity') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });
}

function broadcastDocActivity(data) {
  if (!wss) return;
  const msg = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === client.OPEN) client.send(msg);
  }
}

module.exports = { initDocActivity, broadcastDocActivity };
