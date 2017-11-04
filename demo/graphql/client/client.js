const socket = new WebSocket('ws://localhost:8080', 'echo-protocol')
socket.onopen = function(event) {
  socket.send(JSON.stringify({
    type: 'accept',
    data: ['subscription']
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
    type: 'subscription',
    data: {
      events: ['createUser'],
      payload: `{
        users {
          name
        }
      }`
    }
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
