module.exports = function(periods, candlestick, vectors) {
  const candle = Object.assign({}, candlestick);
  for (let i=2; i<=periods; i++) {
    candle[`sma${i}`] = vectors.getSMA(i);
    candle[`ema${i}`] = vectors.getEMA(i);
    candle[`slope${i}`] = vectors.getSlope(i);
    candle[`yintercept${i}`] = vectors.getYIntercept(i);
    candle[`r${i}`] = vectors.getR(i);
  }
  return candle;
}