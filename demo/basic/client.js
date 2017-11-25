const signinForm = document.getElementById('signin-form')
const signinStatus = document.getElementById('signin-status')
const messageBoard = document.getElementById('message-board')
const messageForm = document.getElementById('message-form')

let signinTimeout
let token
let userID

const socket = new WebSocket("ws://localhost:8080", "echo-protocol")
socket.onopen = function(e) {
  socket.send(JSON.stringify({
    type: 'accept',
    data: ['message', 'signin', 'alert']
  }))

  start()
}

socket.onmessage = function(e) {
  const res = JSON.parse(e.data)

  switch(res.type){
    case 'signin':
    clearTimeout(signinTimeout)

    if (res.data.success) {
      token = res.data.token
      userID = res.data.userID
      goToChatRoom()
    } else {
      showSigninError(res.data.message)
    }
    break

    case 'message':
    showNewMessage(res.data)
    break

    case 'alert':
    showNewAlert(res.data)
    break
  }
}

function start() {
  signinForm.addEventListener('submit', e => {
    e.preventDefault()
    const { username } = e.target.elements
    username.disabled = true
    signin(username.value)
  })

  messageForm.addEventListener('submit', e => {
    e.preventDefault()
    const { message } = e.target.elements
    sendMessage(message.value)
    message.value = ''
  })
}

function signin(username) {
  signinStatus.textContent = ''

  socket.send(JSON.stringify({
    type: 'signin',
    data: username
  }))

  signinTimeout = setTimeout(function () {
    showSigninError()
  }, 5000)
}

function showSigninError(error) {
  signinStatus.textContent = error || 'There was an error. Please try again later.'
  username.disabled = false
}

function goToChatRoom() {
  const signin = document.getElementById('signin')
  const chatRoom = document.getElementById('chat-room')

  signin.style.display = 'none'
  chatRoom.style.display = 'block'
}

function showNewMessage(msg) {
  const newMessage = document.createElement('div')

  const author = msg.userID === userID
    ? 'me'
    : msg.username

  newMessage.className = 'message'
  newMessage.innerHTML = `<b>${author}:</b> ${msg.message}`
  messageBoard.append(newMessage)
}

function showNewAlert(msg) {
  const newMessage = document.createElement('div')
  newMessage.className = 'message'
  newMessage.innerHTML = msg
  messageBoard.append(newMessage)
}

function sendMessage(msg) {
  socket.send(JSON.stringify({
    type: 'message',
    data: {
      message: msg,
      token: token
    }
  }))
}
