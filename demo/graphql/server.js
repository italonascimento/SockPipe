const http = require('http')
const { SockPipe } = require('../../dist/sockpipe')
const fs = require('fs')
const index = fs.readFileSync('index.html')
const index2 = fs.readFileSync('index2.html')
const { Observable, Subject } = require('rxjs')
const { graphql, buildSchema } = require('graphql')

const users = [
  {
    name: 'John',
    age: 27
  },
  {
    name: 'Joane',
    age: 28
  }
]

const schema = buildSchema(`
  type User {
    name: String
    age: Int
  }

  type Query {
    users: [User]
    user(n: Int!): User
  }
`);

const root = {
  users: () => users,
  user: ({ n }) => users[n]
}

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'})

  if (req.url === '/one') {
    res.end(index)
  } else if (req.url === '/two') {
    res.end(index2)
  }
})
server.listen(8080)

new SockPipe({
  httpServer: server,
  debug: false,
  resolver: (msg$) =>
    [
      route(msg$, 'query', queryHandler),
      route(msg$, 'mutation', mutationHandle),
      route(msg$, 'subscribe', subscribeHandle)
    ]
})
  .start()

function route(msg$, route, handle) {
  return handle(
    msg$
    .filter(msg => msg.type === route)
    .map(msg => msg.data)
  )
}

function queryHandler(msg$) {
  return msg$
    .switchMap(resolveQuery)
}

function mutationHandle(msg$) {
  return msg$
}

const fakeEvent = new Subject()

let i = 0
const interval = setInterval(() => {
  if (i == 9) {
    clearInterval(interval)
  }

  fakeEvent.next()
  i += 1
}, 1000)

function subscribeHandle(msg$) {
  return fakeEvent
    .withLatestFrom(
      msg$,
      (_, msg) => msg
    )
    .switchMap(resolveQuery)
}

function resolveQuery(query) {
  return Observable.fromPromise(graphql(schema, query, root))
}
