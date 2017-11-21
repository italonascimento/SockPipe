import { Observable } from 'rxjs'
import { Message } from './sockpipe'

export type Handler = (T: any) => Observable<Message>

export default function(msg$: Observable<Message>) {
  return function(type: string, handle: Handler) {
    const result = handle(
      msg$
        .filter(msg => msg.type === type)
        .map(msg => msg.data)
    )

    if (result) {
      return result
        .map(data => ({
          data,
          type,
        }))
    }
  }
}
