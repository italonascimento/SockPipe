function createSocket() {
  const socket = new WebSocket('ws://localhost:8080', 'echo-protocol')
  socket.onopen = function(event) {
    socket.send(JSON.stringify({
      type: 'accept',
      data: ['query']
    }))

    socket.send(JSON.stringify({
      type: 'query',
      data: `{
        user(n: 1) {
          name
        }
      }`
    }))

    socket.send(JSON.stringify({
      type: 'subscribe',
      data: `{
        user(n: 1) {
          name
        }
      }`
    }))
  }

  socket.onmessage = function(e) {
    console.log(JSON.parse(e.data))
  }
}

window.addEventListener("load", createSocket, false)
