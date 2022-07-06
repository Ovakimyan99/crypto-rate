const API_KEY = '1f1324bcfbcd16172a16005b42d61405f05bdb0cbada09b2ec5d6cffdcc72948'
const tickersHandlers = new Map
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`)
const AGGREGATE_INDEX = '5'

export const subscriberToTickers = (ticker, cb) => {
  const subscriber = tickersHandlers.get(ticker) || []
  tickersHandlers.set(ticker, [...subscriber, cb])
  subscribeToTickerOnWs(ticker)
}

export const unsubscriberFromTickers = (ticker) => {
  tickersHandlers.delete(ticker)
  unsubscribeFromTickerOnWs(ticker)
}

socket.addEventListener('message', event => {
  const {
    TYPE: type,
    FROMSYMBOL: ticker,
    PRICE: price
  } = JSON.parse(event.data)

  if(AGGREGATE_INDEX !== type || !price) {
    return
  }

  const handlersList = tickersHandlers.get(ticker) ?? []
  handlersList.forEach(fn => fn(ticker, price))
})

function sendToWs(objectSettings) {
  const message = JSON.stringify(objectSettings)

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(message)
    return
  }

  socket.addEventListener('open', () => {
    socket.send(message)
  }, { once: true })
}

function subscribeToTickerOnWs(ticker) {
  sendToWs({
    'action': 'SubAdd',
    'subs': [`5~CCCAGG~${ticker}~USD`]
  })
}

function unsubscribeFromTickerOnWs(ticker) {
  sendToWs({
    'action': 'SubRemove',
    'subs': [`5~CCCAGG~${ticker}~USD`]
  })
}

window.tickers = tickersHandlers
