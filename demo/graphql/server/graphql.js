const { buildSchema } = require('graphql')
const { users } = require('./db')

module.exports = {
  schema: buildSchema(`
    type User {
      name: String
      age: Int
    }

    type Query {
      users: [User]
      user(n: Int!): User
    }
  `),

  root: {
    users: () => users,
    user: ({ n }) => users[n]
  }
}
