import axios from 'axios';
import { DateTime } from 'luxon';

const API_TOKEN = 'ZjZaaWFoeUZPTmZSSDFqb1ljZldad3MwTFk4cHdoaDNROVNXb2d3T0RPYz0';

export function marketFactory() {
  return {
    async getStockPrices(symbols = []) {
      const { data } = await axios.get('https://api.marketdata.app/v1/stocks/bulkquotes', {
        params: {
          symbols: symbols.join(','),
        },
        headers: { Authorization: `Bearer ${API_TOKEN}` },
      });
      return data;
    },

    async getOptionChain(symbol, expiration = null, side = 'call') {
      const { data } = await axios.get(`https://api.marketdata.app/v1/options/chain/${symbol.toUpperCase()}`, {
        params: {
          expiration,
          side,
        },
        headers: { Authorization: `Bearer ${API_TOKEN}` },
      });
      return data;
    },
    async getOptionQuote(symbol) {
      const { data } = await axios.get(`https://api.marketdata.app/v1/options/quotes/${symbol.toUpperCase()}`, {
        params: {},
        headers: { Authorization: `Bearer ${API_TOKEN}` },
      });
      return data;
    },
    async getStatus() {
      try {
        const { data } = await axios.get(`https://api.marketdata.app/v1/markets/status`, {
          headers: { Authorization: `Bearer ${API_TOKEN}` },
        });
        if (data.s === 'ok') {
          return data.status[0];
        } else {
          return 'error';
        }
      } catch (err) {
        return 'fail';
      }
    },
    async getOptionChain(symbol, expiration, side = 'call') {
      try {
        const { data } = await axios.get(`https://api.marketdata.app/v1/options/chain/${symbol}?expiration=${expiration}&side=${side}`, {
          headers: { Authorization: `Bearer ${API_TOKEN}` },
        });
        console.log('data', data);
      } catch (err) {
        return 'fail';
      }
    },
  };
}
