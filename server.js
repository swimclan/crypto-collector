const express = require('express');
const bodyParser = require('body-parser')
const redis = require('redis');
const Coinbase = require('./src/factories/coinbase');
const Chart = require('./src/factories/chart');
const Collection = require('./src/collection');
const Vectors = require('./src/vectors');
require('dotenv').config();

const app = express();
app.use(bodyParser.json({ strict: false }));
const PORT = process.env.PORT || 3000;
const SOCKET_CYCLE_TIME = +process.env.SOCKET_CYCLE_TIME;

const db = redis.createClient({ url: process.env.REDIS_DB_URL, port: process.env.REDIS_DB_PORT });
db.on('connect', () => console.log('Redis DB Connected'));
db.on('error', (error) => console.log(error));

const Candles = Collection('candle', db);
const vectors = Vectors();
let coinbaseChart;

const cycleChartConnection = (loop = false) => {
  const newCoinbase = Coinbase();
  const newWebsocket = newCoinbase.websocket;
  coinbaseChart.recycleWebsocket(newWebsocket);
  loop && setTimeout(() => {
    console.log('Reset websocket!');
    cycleChartConnection(true);
  }, SOCKET_CYCLE_TIME);
}

const chartCloseHandler = (data) => {
  vectors.addPrice(data.last);
  Candles.add(data).then((index) => {
    console.log(`Added candle: ${index}`);
  });
};

const chartErrorHandler = (error) => {
  console.log('An error occured', error);
  cycleChartConnection(false);
}

coinbaseChart = Chart(Coinbase());
coinbaseChart.on('close', chartCloseHandler);
coinbaseChart.on('error', chartErrorHandler);
SOCKET_CYCLE_TIME && cycleChartConnection(true);

app.get('/api/candles/last/:n', function(req, res, next) {
  const n = req.params.n;
  Candles.getLast(n).then((data) => {
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

