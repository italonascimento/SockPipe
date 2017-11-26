const signinForm = document.getElementById('signin-form')
const signinStatus = document.getElementById('signin-status')
const messageBoard = document.getElementById('message-board')
const messageForm = document.getElementById('message-form')

let token
let userID
let signinTimeout

// Stablish connection
const socket = new WebSocket("ws://localhost:8080", "echo-protocol")
socket.onopen = function(e) {
  socket.send(JSON.stringify({
    type: 'accept',
    data: ['signin', 'message', 'alert']
  }))
}

// Proccess incoming messages from server
socket.onmessage = function(e) {
  const res = JSON.parse(e.data)

  switch(res.type){
    case 'signin':
    ui.signinReset()

    if (res.data.success) {
      token = res.data.token
      userID = res.data.userID

      ui.goToChatRoom()
    } else {
      ui.signinError(res.data.message)
    }
    break

    case 'message':
    ui.newMessage(res.data)
    break

    case 'alert':
    ui.newAlert(res.data)
    break
  }
}

// Send messages to server
signinForm.addEventListener('submit', e => {
  e.preventDefault()
  const { username: {value} } = e.target.elements
  username.disabled = true

  socket.send(buildSigninMessage(value))
  ui.signinPending()
})

messageForm.addEventListener('submit', e => {
  e.preventDefault()
  const { message: {value} } = e.target.elements
  socket.send(buildChatMessage(value))
  message.value = ''
})

const buildSigninMessage = (username) =>
  JSON.stringify({
    type: 'signin',
    data: username
  })

const buildChatMessage = (msg, token) =>
  JSON.stringify({
    type: 'message',
    data: {
      message: msg,
      token: token
    }
  })

// Manipulate UI
const ui = {
  signinPending() {
    signinStatus.textContent = ''

    signinTimeout = setTimeout(function () {
      this.signinError()
    }, 5000)
  },

  signinError(error) {
    signinStatus.textContent = error || 'There was an error. Please try again later.'
    username.disabled = false
  },

  signinReset() {
    clearTimeout(signinTimeout)
  },

  goToChatRoom() {
    const signin = document.getElementById('signin')
    const chatRoom = document.getElementById('chat-room')

    signin.style.display = 'none'
    chatRoom.style.display = 'block'
  },

  newMessage(msg) {
    const newMessage = document.createElement('div')

    const author = msg.userID === userID
      ? 'me'
      : msg.username

    newMessage.className = 'message'
    newMessage.innerHTML = `<b>${author}:</b> ${msg.message}`
    messageBoard.append(newMessage)
  },

  newAlert(msg) {
    const newMessage = document.createElement('div')
    newMessage.className = 'message'
    newMessage.innerHTML = `<i>${msg}</i>`
    messageBoard.append(newMessage)
  }
}
