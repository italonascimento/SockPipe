import { Observable } from 'rxjs'
import { Message } from './sockpipe'

export type RouteHandler = (T: any) => Observable<Message>

export default function(msg$: Observable<Message>) {
  return function(type: string, handle: RouteHandler) {
    return handle(
      msg$
      .filter(msg => msg.type === type)
      .map(msg => msg.data)
    )
    .map(res => ({
      ...res,
      type,
    }))
  }
}
