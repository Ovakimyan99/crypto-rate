import {
  subscribeToTickerOnWs,
  unsubscribeFromTickerOnWs
} from '@/api'

export const tickersHandlers = new Map

export const subscriberToTickers = (ticker, cb) => {
  const subscriber = tickersHandlers.get(ticker) || []
  tickersHandlers.set(ticker, [...subscriber, cb])
  subscribeToTickerOnWs(ticker)
}

export const unsubscriberFromTickers = (ticker) => {
  tickersHandlers.delete(ticker)
  unsubscribeFromTickerOnWs(ticker)
}
