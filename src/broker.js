import axios from 'axios';

export function brokerFactory(apiKey) {
  const api = {
    async getAccountPositions() {
      const { data } = axios.get(`https://api01.iq.questrade.com/v1/markets/quotes/MSTX`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      console.log('positions', data);
    },
  };

  return api;
}
