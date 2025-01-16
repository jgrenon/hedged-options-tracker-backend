import { identity, map } from 'lodash';

export function stockPriceUpdate({ store, market }) {
  console.log('registering current value metric');
  const _state = {};

  async function updatePrices() {
    const prices = await market.getStockPrices(['MSTX', 'MSTY', 'TSLL', 'TSLY']);
    store.getState().updateMarketPrices(prices);

    // retrieve current strategies option infos
    // const optSymbols = map(store.getState().strategies, (strategy) => strategy.option.id).filter(identity);

    // console.log('loading current price for options', optSymbols);
    // const optPrices = await Promise.all(optSymbols.map((s) => market.getOptionQuote(s)));
    // store.getState().updateOptionPrices(optPrices);
  }

  async function checkMarketStatus() {
    const status = await market.getStatus();
    console.log('market status: ', status);
    if (status === 'open') {
      if (!_state.timer) {
        console.log("Market is open. Let's start our price refresh job");
        _state.timer = setInterval(updatePrices, 2 * 60 * 1000);
        updatePrices();
      }
    } else {
      if (_state.timer) {
        console.log("Market is closed. Let's do a last price update");
        updatePrices();
        clearInterval(_state.timer);
        delete _state.timer;
      }
    }
  }

  checkMarketStatus();
  updatePrices();

  // check if market is open or closed every 5 minutes
  setInterval(checkMarketStatus, 300 * 1000);

  return function () {
    _state.timer && clearInterval(_state.timer);
  };
}
