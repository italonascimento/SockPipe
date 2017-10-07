const { graphql } = require('graphql')
const { Observable } = require('rxjs')
const { schema, root } = require('./graphql')

function resolveQuery(query) {
  return Observable.fromPromise(graphql(schema, query, root))
}

module.exports = {
  queryHandler(msg$) {
    return msg$
    .switchMap(resolveQuery)
    .map(res => ({
      type: 'query',
      data: res
    }))
  },

  mutationHandler(msg$) {
    return msg$
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
          data: res
        }))
  },
}
