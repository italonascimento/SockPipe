const { graphql } = require('graphql')
const { Observable } = require('rxjs')
const { schema, root, update$ } = require('./graphql')

function resolveQuery(query) {
  return Observable.fromPromise(graphql(schema, query, root))
}

module.exports = {
  graphQLHandler(msgData$) {
    return msgData$
      .switchMap(resolveQuery)
  },

  subscriptionHandler(msgData$) {
    return update$
      .withLatestFrom(
        msgData$,
        (update, msg) =>
          msg.events.includes(update)
            ? msg.query
            : undefined
      )
      .filter(Boolean)
      .switchMap(resolveQuery)
  },
}
