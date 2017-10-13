import { Subject } from 'rxjs'
import { Handler } from '../createRouter'
import { Observable } from 'rxjs'

export interface SubscriptionData{
  events: string[]
  payload?: any
}

export default function(update$: Observable<string>, handle: Handler) {
  return (msgData$: Observable<SubscriptionData>) =>
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
