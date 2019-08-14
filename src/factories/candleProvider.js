module.exports = function(periods, interval, candlestick, vectors) {
  const candle = Object.assign({}, candlestick);
  for (let i=interval; i<=periods; i+=interval) {
    candle[`sma${i}`] = vectors.getSMA(i);
    candle[`ema${i}`] = vectors.getEMA(i);
    candle[`slope${i}`] = vectors.getSlope(i);
    candle[`yintercept${i}`] = vectors.getYIntercept(i);
    candle[`r${i}`] = vectors.getR(i);
  }
  return candle;
}