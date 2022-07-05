const API_KEY = '1f1324bcfbcd16172a16005b42d61405f05bdb0cbada09b2ec5d6cffdcc72948'
const tickersHandlers = new Map

// TODO: refactor to use URLSearchParam
const loadTickers = () => fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${
  [...tickersHandlers.keys()]
  .join(',')
  }&tsyms=USD&api_key=${API_KEY}`)
  .then(price => price.json())
  .then(rawData => {
    return Object.fromEntries(
      Object.entries(rawData).map(([key, value]) => [key, value.USD])
    )
  })
  .then(updatedData => {
    Object.entries(updatedData).forEach(([ticker, currency]) => {
      const handlersList = tickersHandlers.get(ticker) ?? []
      handlersList.forEach(fn => fn({ ticker, currency }))
    })

    return updatedData
  })

export const subscriberToTickers = (ticker, cb) => {
  const subscriber = tickersHandlers.get(ticker) || []
  tickersHandlers.set(ticker, [...subscriber, cb])
}

export const unsubscriberFromTickers = (ticker) => {
  tickersHandlers.delete(ticker)
}

setInterval(loadTickers, 5000)

window.tickers = tickersHandlers
