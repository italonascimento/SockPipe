const { graphql } = require('graphql')
const { Observable } = require('rxjs')

module.exports = {
  graphQLHandler(schema, root) {
    const resolveQuery = (query) =>
      Observable.fromPromise(graphql(schema, query, root))

    return (msgData$) =>
      msgData$
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
