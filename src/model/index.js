const Sequelize = require('sequelize');
const Model = Sequelize.Model;

module.exports = function(modelname, db, dbtype='redis', schema=null) {
  switch(dbtype) {
    case 'postgres':
      class Table extends Model {}
      Table.init(schema, {
        sequelize: db,
        modelName: modelname
      });
      Table.sync({force: true});
      return Table;
    case 'redis':
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
}
