module.exports.average = function(arr, prop = null) {
  return arr.reduce((acc, val) => {
    acc += Number(prop == null ? val : val[prop]);
    return acc;
  }, 0) / arr.length;
}