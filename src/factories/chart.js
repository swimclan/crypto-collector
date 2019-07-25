const { Chart, Simulator } = require('candlestick-models');

module.exports = function({
  timeframe = '1m',
  websocket = Simulator(Number(process.env.SIMULATOR_VOLATILITY)),
  propMap = (function() {
    const propMap = new Map();
    propMap.set('price', 'price');
    propMap.set('size', 'size');
    propMap.set('symbol', 'symbol');
    return propMap;
  })(),
  filterFn = data => data,
  listenerEventName = 'quote'
} = {})
{
  if (!typeof timeframe === 'string') {
    throw new Error('Timeframe must be specified and a string');
  }
  
  return Chart(websocket, timeframe, {
    propMap,
    filterFn,
    listenerEventName
  });
}
