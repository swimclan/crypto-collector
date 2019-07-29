const Vector = require('subvector');
const {average, regressionSlope, regressionYIntercept, correlationCoefficient} = require('../utils');

module.exports = function() {
  const prices = Vector();
  const smas = [];
  const emas = [];
  const slopes = [];
  const yInts = [];
  const rs = [];

  const computeSMAs = () => {
    const length = prices.length;
    clearArray(smas);
    for (let i=1; i<=length; i++) {
      smas.push(average(prices.get(i)));
    }
  }

  const computeEMAs = () => {
    // More to do here!
    emas.forEach((price, i) => {
      emas[i] = ((prices.at(prices.length) - emas[i]) * (2 / (i + 2))) + emas[i]
    });
    emas.push(smas[prices.length - 1]);
  }

  const clearArray = (arr) => {
    while (arr.length) {
      arr.pop();
    }
  }

  const computeSlopes = () => {
    const length = prices.length;
    clearArray(slopes);
    let priceSubVector, periodsSubVector;
    for (let i=1; i<=length; i++) {
      priceSubVector = prices.get(i);
      periodsSubVector = priceSubVector.map((price, index) => index);
      slopes.push(regressionSlope(periodsSubVector, priceSubVector));
    }
  }

  const computeYIntercepts = () => {
    const length = prices.length;
    clearArray(yInts);
    let periodsSubVector, priceSubVector;
    for (let i=1; i<=length; i++) {
      priceSubVector = prices.get(i);
      periodsSubVector = priceSubVector.map((price, index) => index)
      yInts.push(regressionYIntercept(average(periodsSubVector), average(priceSubVector), slopes[i - 1]));
    }
  }

  const computeRs = () => {
    const length = prices.length;
    clearArray(rs);
    let periodsSubVector, priceSubVector;
    for (let i=1; i<=length; i++) {
      priceSubVector = prices.get(i);
      periodsSubVector = priceSubVector.map((price, index) => index)
      rs.push(correlationCoefficient(periodsSubVector, priceSubVector));
    }
  }

  return {
    addPrice(newPrice) {
      prices.add(newPrice);
      computeSMAs();
      computeEMAs();
      computeSlopes();
      computeYIntercepts();
      computeRs();
    },
    getSMA(period = smas.length) {
      return smas[period - 1];
    },
    getEMA(period = emas.length) {
      return emas[period - 1];
    },
    getSlope(period = slopes.length) {
      return slopes[period - 1];
    },
    getYIntercept(period = yInts.length) {
      return yInts[period - 1];
    },
    getR(period = rs.length) {
      return rs[period - 1];
    }

  }
}