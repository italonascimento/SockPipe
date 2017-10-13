const { buildSchema } = require('graphql')
const { users } = require('./db')
const { Subject } = require('rxjs')

const events$ = new Subject()

module.exports = {
  schema: buildSchema(`
    input UserInput {
      name: String
      age: Int
    }

    type User {
      name: String
      age: Int
    }

    type Query {
      users: [User]
      user(n: Int!): User
    }

    type Mutation {
      createUser(input: UserInput): User
    }
  `),

  root: {
    users: () => users,
    user: ({ n }) => users[n],

    createUser: ({ input }) => {
      users.push(input)
      events$.next('createUser')
      return input
    }
  },

  events: events$.asObservable(),
}
