var CoinbasePro = require('coinbase-pro');

module.exports = {
  get websocket() {
    return new CoinbasePro.WebsocketClient(
      ['BTC-USD'],
      'wss://ws-feed.pro.coinbase.com',
      {
        key: process.env.COINBASE_KEY,
        secret: process.env.COINBASE_SECRET,
        passphrase: process.env.COINBASE_PASSPHRASE
      },
      { channels: ['matches'] }
    );
  },
  get propMap() {
    const propMap = new Map();
    propMap.set('price', 'price');
    propMap.set('size', 'size');
    propMap.set('symbol', 'product_id');
    return propMap;
  },
  listenerEventName: 'message',
  filterFn(quote) { return quote.type === 'match' }
};