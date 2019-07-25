module.exports = function(modelname, db) {
  return {
    create: function(obj, index) {
      return new Promise(function(resolve, reject) {
        let data = [`${modelname}:${index}`, 'index', index];
        Object.entries(obj).forEach(function(entry) {
          data = data.concat(entry);
        });
        db.hmset(...data, function(error, data) {
          if (error) {
            return reject(error);
          }
          return resolve(data);
        });
      });
    }
  }
}
