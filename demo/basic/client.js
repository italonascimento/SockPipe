const messageBoard = document.getElementById('message-board')
const messageForm = document.getElementById('message-form')
const messageBox = document.getElementById('message-box')

const socket = new WebSocket("ws://localhost:8080", "echo-protocol")
socket.onopen = function(e) {
  socket.send(JSON.stringify({
    type: 'accept',
    data: ['message']
  }))

  start()
}

socket.onmessage = function(e) {
  const res = JSON.parse(e.data)
  const newMessage = document.createElement('div')
  newMessage.className = 'message'
  newMessage.textContent = res.data
  messageBoard.append(newMessage)
}

function start() {
  messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    sendMessage(messageBox.value)
    messageBox.value = ''
  })
}

function sendMessage(msg) {
  socket.send(JSON.stringify({
    type: 'message',
    data: msg
  }))
}
