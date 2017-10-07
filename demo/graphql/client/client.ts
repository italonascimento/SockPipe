function createSocket() {
  const socket = new WebSocket('ws://localhost:8080', 'echo-protocol')
  socket.onopen = function(event) {
    socket.send(JSON.stringify({
      type: 'accept',
      data: ['query']
    }))

    socket.send(JSON.stringify({
      type: 'graphql',
      data: `{
        user(n: 1) {
          name
        }
      }`
    }))

    socket.send(JSON.stringify({
      type: 'subscribe',
      data: `{
        users {
          name
        }
      }`
    }))

    socket.send(JSON.stringify({
      type: 'graphql',
      data: `
        mutation {
          createUser( input: {
            name: "Zach",
            age: 21
          }) {
            name,
            age
          }
        }
    `}))
  }

  socket.onmessage = function(e) {
    console.log(JSON.parse(e.data))
  }
}

window.addEventListener("load", createSocket, false)
