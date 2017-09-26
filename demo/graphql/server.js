const http = require('http')
const { SockPipe } = require('../../dist/sockpipe')
const fs = require('fs')
const index = fs.readFileSync('index.html')
const { Observable } = require('rxjs')
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
  res.end(index)
})
server.listen(8080)

new SockPipe({
  httpServer: server,
  debug: true,
  open: (msg$) =>
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

function subscribeHandle(msg$) {
  return msg$
    .combineLatest(
      Observable.interval(2000),
      (msg) => msg
    )
    .switchMap(resolveQuery)
    .take(5)
}

function resolveQuery(query) {
  return Observable.fromPromise(graphql(schema, query, root))
}
