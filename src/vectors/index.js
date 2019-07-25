const Vector = require('subvector');
const {average} = require('../utils');

module.exports = function() {
  const prices = Vector();
  const smas = [];
  const emas = [];

  const computeSMAs = () => {
    const length = prices.length;
    clearSMAs();
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

  const clearSMAs = () => {
    while (smas.length) {
      smas.pop();
    }
  }

  return {
    addPrice(newPrice) {
      prices.add(newPrice);
      computeSMAs();
      computeEMAs();
    },
    getSMA(period = smas.length) {
      return smas[period - 1];
    },
    getEMA(period = emas.length) {
      return emas[period - 1];
    }
  }
}