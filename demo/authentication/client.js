const form = document.getElementById('login-form')
const status = document.getElementById('status-msg')

const token = localStorage.getItem('token')
if (token) {
  status.textContent = 'Already logged'
}

const socket = new WebSocket("ws://localhost:8080", "echo-protocol")
socket.onopen = function(e) {
  socket.send(JSON.stringify({
    type: 'accept',
    data: ['auth']
  }))

  start()
}

function start() {
  form.addEventListener('submit', (e) => {
    e.preventDefault()

    const { username, password } = e.target.elements

    socket.send(JSON.stringify({
      type: 'auth',
      data: {
        username: username.value,
        password: password.value,
      }
    }))
  })
}

socket.onmessage = function(e) {
  const res = JSON.parse(e.data)

  if (res.data.success) {
    localStorage.setItem('token', res.data.token)
    status.textContent = 'Logged in successfully'
  } else {
    status.textContent = res.data.error
    localStorage.removeItem('token')
  }
}
