import { graphql, GraphQLSchema } from 'graphql'
import { Observable } from 'rxjs'

export default function(schema: GraphQLSchema, root: any) {
  const resolveQuery = (query: string) =>
    Observable.fromPromise(graphql(schema, query, root))

  return (msgData$: Observable<string>) =>
    msgData$
      .switchMap(resolveQuery)
}
