const WebSocket = require('ws');

// WebSocket server
let wsServer;

module.exports = (req, res) => {
  if (!wsServer) {
    const server = res.socket.server;
    wsServer = new WebSocket.Server({ server });

    wsServer.on('connection', (socket) => {
      console.log('Client connected');

      socket.on('message', (message) => {
        // Broadcast the message to all clients
        wsServer.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      });

      socket.on('close', () => {
        console.log('Client disconnected');
      });
    });
    console.log('WebSocket server created');
  } else {
    console.log('WebSocket server already running');
  }

  res.status(200).end();
};
