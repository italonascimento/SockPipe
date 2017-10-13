const { graphql } = require('graphql')
const { Observable } = require('rxjs')
const { schema, root } = require('./graphql')

function resolveQuery(query) {
  return Observable.fromPromise(graphql(schema, query, root))
}

module.exports = {
  graphQLHandler(msgData$) {
    return msgData$
      .switchMap(resolveQuery)
  },

  subscriptionHandler(update$, handle) {
    return (msgData$) =>
      handle(
        update$
        .withLatestFrom(
          msgData$,
          (update, msg) =>
          msg.events.includes(update)
          ? msg.payload
          : undefined
        )
        .filter(Boolean)
      )
  }
}
