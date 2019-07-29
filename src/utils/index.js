const average = function(arr, prop = null) {
  return arr.reduce((acc, val) => {
    acc += Number(prop == null ? val : val[prop]);
    return acc;
  }, 0) / arr.length;
}

const sum = function(arr) {
  return arr.reduce((acc, val) => {
    return acc += val;
  }, 0)
}

const getErrors = function(ns, mean) {
  return ns.map(n => n - mean);
}

const getErrorProducts = function(xErrors, yErrors) {
  if (xErrors.length !== yErrors.length) {
    throw new Error('The input axis vectors must be of equal length');
  }
  const ret = [];
  for (let i = 0; i < xErrors.length; i++) {
    ret.push(xErrors[i] * yErrors[i]);
  }
  return ret;
}

const correlationCoefficient = function(xs, ys) {
  const xBar = average(xs);
  const yBar = average(ys);
  const xErrors = getErrors(xs, xBar);
  const yErrors = getErrors(ys, yBar);
  const xErrorSquareds = xErrors.map(error => Math.pow(error, 2));
  const yErrorSquareds = yErrors.map(error => Math.pow(error, 2));
  const errorProducts = getErrorProducts(xErrors, yErrors);
  return (sum(errorProducts)) / Math.sqrt(sum(xErrorSquareds) * sum(yErrorSquareds))
}

const standardDev = function(n, errorSquareds) {
  return Math.sqrt(sum(errorSquareds) / (n - 1));
}

const regressionSlope = function(xs, ys) {
  if (xs.length !== ys.length) {
    throw new Error('The input axis vectors must be of equal length');
  }
  const xBar = average(xs);
  const yBar = average(ys);
  const xErrors = getErrors(xs, xBar);
  const yErrors = getErrors(ys, yBar);
  const xErrorSquareds = xErrors.map(error => Math.pow(error, 2));
  const yErrorSquareds = yErrors.map(error => Math.pow(error, 2));
  const r = correlationCoefficient(xs, ys);
  return r * (standardDev(ys.length, yErrorSquareds) / standardDev(xs.length, xErrorSquareds));
}

const regressionYIntercept = function(xBar, yBar, slope) {
  return yBar - (slope * xBar);
}

module.exports = {
  average, sum, correlationCoefficient, regressionSlope, regressionYIntercept
};