const express = require('express');
const bodyParser = require('body-parser')
const redis = require('redis');
const Sequelize = require('sequelize');
const Model = require('./src/model');
const CandleProvider = require('./src/factories/candleProvider');
const Coinbase = require('./src/factories/coinbase');
const Chart = require('./src/factories/chart');
const Cache = require('./src/cache');
const Vectors = require('./src/vectors');
const Schema = require('./src/factories/schema');
require('dotenv').config();

const app = express();
app.use(bodyParser.json({ strict: false }));
const PORT = process.env.PORT || 3000;
const SOCKET_CYCLE_TIME = +process.env.SOCKET_CYCLE_TIME;
const MAX_PERIODS = +process.env.MAX_PERIODS;

// Connect Redis
const redisdb = redis.createClient({ url: process.env.REDIS_DB_URL, port: process.env.REDIS_DB_PORT });
redisdb.on('connect', () => console.log('Redis DB Connected'));
redisdb.on('error', (error) => console.log(error));

// Connect Postgres
const postgresdb = new Sequelize(
  process.env.POSTGRES_DB_NAME,
  process.env.POSTGRES_DB_USER,
  process.env.POSTGRES_DB_PASS, {
  host: process.env.POSTGRES_DB_HOST,
  dialect: 'postgres',
  port: process.env.POSTGRES_DB_PORT
});
postgresdb.authenticate()
  .then(() => {
    console.log('PostgreSQL DB Connected');
  })
  .catch((error) => {
    console.log(typeof error === 'object' ? error : {error});
  });

const CandlesCache = Cache('candle', redisdb);
const CandleModel = Model('candle', postgresdb, 'postgres', Schema(MAX_PERIODS));
const vectors = Vectors();
let coinbaseChart, lastHeartbeat = Date.now();

const chartHeartbeatHandler = (message) => {
  if (message.type === 'heartbeat') {
    const now = Date.now();
    lastHeartbeat = now;
  }
}

const cycleChartConnection = (loop = false) => {
  const newCoinbase = Coinbase(chartHeartbeatHandler);
  const newWebsocket = newCoinbase.websocket;
  coinbaseChart.recycleWebsocket(newWebsocket);
  loop && setTimeout(() => {
    console.log('Reset websocket!');
    cycleChartConnection(true);
  }, SOCKET_CYCLE_TIME);
}

const chartCloseHandler = (data) => {
  vectors.addPrice(data.last);
  CandlesCache.add(data).then((index) => {
    CandleModel.create(CandleProvider(MAX_PERIODS, data, vectors));
    console.log(`Added candle: ${index}`);
  });
};

const timer = (interval) => {
  setTimeout(() => {
    const now = Date.now();
    heartbeatAge = now - lastHeartbeat;
    if (heartbeatAge > interval) {
      console.log('Lost connection to websocket!  Recycling...');
      cycleChartConnection();
    }
    timer(interval);
  }, 10000)
}

const chartErrorHandler = (error) => {
  console.log('An error occured', error);
  cycleChartConnection(false);
}

coinbaseChart = Chart(Coinbase(chartHeartbeatHandler));
coinbaseChart.on('close', chartCloseHandler);
coinbaseChart.on('error', chartErrorHandler);
SOCKET_CYCLE_TIME && cycleChartConnection(true);
timer(5000);

app.get('/api/candles/last/:n', function(req, res, next) {
  const n = req.params.n;
  CandlesCache.getLast(n).then((data) => {
    res.status(200).json(data);
  });
});

app.get('/api/indicators/movingaverage/:type/:period', function(req, res, next) {
  const period = req.params.period;
  const type = req.params.type;
  let responseValue;
  switch (type) {
    case 'simple':
      responseValue = vectors.getSMA(+period);
      break;
    case 'exponential':
      responseValue = vectors.getEMA(+period);
      break;
    default:
      responseValue = null;
  }
  res.status(200).json(responseValue);
});

app.get('/api/indicators/regression/:type/:period', function(req, res, next) {
  const period = req.params.period;
  const type = req.params.type;
  let responseValue;
  switch (type) {
    case 'slope':
      responseValue = vectors.getSlope(period);
      break;
    case 'yintercept':
      responseValue = vectors.getYIntercept(period);
      break;
    case 'r':
      responseValue = vectors.getR(period);
      break;
    default:
      responseValue = null;
  }
  res.status(200).json(responseValue);
});

app.listen(PORT, () => console.log(`Server started at ${new Date().toString()} on port: ${PORT}`));

