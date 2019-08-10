const Model = require('../model');

module.exports = function(modelname, db) {
  return {
    index: 0,
    getOne: function(index) {
      return new Promise((resolve, reject) => {
        db.hgetall(`${modelname}:${index.toString()}`, (error, data) => {
          if (error) {
            return reject(error);
          }
          return resolve(data);
        });
      });
    },
    getLast: function(n) {
      return new Promise((resolve, reject) => {
        const promises = [];
        const earliestIndex = this.index - n >= 0 ? this.index - n : 0;
        let current;
        for (let i=earliestIndex; i<this.index; i++) {
          current = this.getOne(i);
          current && promises.push(current);
        }
        Promise.all(promises).then((data) => {
          resolve(data);
        });
      });
    },
    add: function(obj) {
      return new Promise((resolve, reject) => {
        const candle = Model(modelname, db, 'redis');
        candle.create(obj, this.index).then((data) => {
          const index = this.index++;
          resolve(index);
        });
      });
    }
  }
}