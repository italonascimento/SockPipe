const { graphql } = require('graphql')
const { Observable } = require('rxjs')
const { schema, root, update$ } = require('./graphql')

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

  subscriptionHandler(msg$) {
    return update$
      .withLatestFrom(
        msg$,
        (update, msg) =>
          msg.events.includes(update)
            ? msg.query
            : undefined
      )
      .filter(Boolean)
      .switchMap(resolveQuery)
      .map(res => ({
        type: 'subscription',
        data: res.data
      }))
  },
}
