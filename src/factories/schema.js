const Sequelize = require('sequelize');

module.exports = function(periods) {
  const schema = {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
      primaryKey: true,
      allowNull: false
    },
    open: {
      type: Sequelize.FLOAT
    },
    close: {
      type: Sequelize.FLOAT
    },
    high: {
      type: Sequelize.FLOAT
    },
    low: {
      type: Sequelize.FLOAT
    },
    color: {
      type: Sequelize.INTEGER
    },
    volume: {
      type: Sequelize.FLOAT
    }
  };
  for (let i=2; i<=periods; i++) {
    schema[`ema${i}`] = {
      type: Sequelize.FLOAT
    }
    schema[`sma${i}`] = {
      type: Sequelize.FLOAT
    }
    schema[`slope${i}`] = {
      type: Sequelize.FLOAT
    }
    schema[`yintercept${i}`] = {
      type: Sequelize.FLOAT
    }
    schema[`r${i}`] = {
      type: Sequelize.FLOAT
    }
  }
  return schema;
}