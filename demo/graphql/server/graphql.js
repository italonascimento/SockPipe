const { buildSchema } = require('graphql')
const { users } = require('./db')

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
      console.log(input)
      users.push(input)
      return input
    }
  }
}
