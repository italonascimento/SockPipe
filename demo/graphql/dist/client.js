const client = require('websocket').client;
function createSocket() {
    const socket = new client();
    socket.on('connect', (connection) => {
        connection.sendUTF(JSON.stringify({
            type: 'query',
            data: `{
        user(n: 1) {
          name
        }
      }`
        }));
        connection.sendUTF(JSON.stringify({
            type: 'subscribe',
            data: `{
        users {
          name,
          age
        }
      }`
        }));
        connection.on('message', (msg) => {
            if (msg.utf8Data && msg.type === 'utf8') {
                console.log(JSON.parse(msg.utf8Data));
            }
        });
    });
    socket.connect('ws://localhost:8080/', 'echo-protocol');
}
window.addEventListener("load", createSocket, false);
//# sourceMappingURL=client.js.map