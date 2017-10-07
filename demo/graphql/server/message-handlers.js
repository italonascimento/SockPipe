const { graphql } = require('graphql')
const { Observable } = require('rxjs')
const { schema, root } = require('./graphql')

function resolveQuery(query) {
  return Observable.fromPromise(graphql(schema, query, root))
}

module.exports = {
  graphQLHandler(msg$) {
    return msg$
      .switchMap(resolveQuery)
      .map(res => ({
        type: 'graphql',
        data: res.data
      }))
  },

  subscribeHandler(updateStream$) {
    return (msg$) =>
      updateStream$
        .withLatestFrom(
          msg$,
          (_, msg) => msg
        )
        .switchMap(resolveQuery)
        .map(res => ({
          type: 'subscribe',
          data: res.data
        }))
  },
}
