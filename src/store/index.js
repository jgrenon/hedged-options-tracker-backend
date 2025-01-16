import { createStore } from 'zustand/vanilla';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { merge } from 'lodash';
import { DateTime } from 'luxon';

export function storeFactory(path) {
  const store = createStore(
    immer(
      subscribeWithSelector((set) => {
        return {
          market: {
            MSTX: {},
            MSTY: {},
            TSLL: {},
            TSLY: {},
            options: {},
          },
          portfolio: {
            transactions: [],
          },
          history: [],
          strategies: {
            microstrategy01: {
              name: 'MicroStrategy Dividends Hedged Options',
              growth: {
                symbol: 'MSTX',
                units: 200,
                cost: 40.2,
                price: 43.08,
              },
              dividend: {
                symbol: 'MSTY',
                units: 424,
                cost: 30.693,
                price: 28.75,
                distribution: 2.87,
                date: '2025-01-24',
              },
              option: {
                id: 'MSTX250207C00044000',
                qty: 2,
                premium: 10.2612,
                premium_bonus: 1447.76,
                price: 11.7,
                strike: 44.0,
                expiration: '2025-02-07',
                dte: 23,
                iv: 171.8,
                greeks: {
                  delta: 0.7169,
                  gamma: 0.0137,
                  theta: -0.1838,
                  vega: 0.0438,
                  rho: 0.0149,
                },
              },
              cycle: {
                stk_capped_price: 63.3,
                div_qty: 424,
                extra_div_qty: 120,
                extra_div_cost: 28.6499,
                extra_cash: 62.01,
                extra_div_cash: 462.0,
                cash_balance: 38.67,
                rollover: {
                  premium: 9.9,
                  qty: 2,
                  bonus: 1442.76,
                  strike: 55,
                },
              },
              metrics: {},
            },
          },
          updateMarketPrices(prices) {
            const updatedPrices = {};
            for (let i = 0; i < 4; i++) {
              updatedPrices[prices.symbol[i]] = {
                ask: prices.ask[i],
                askSize: prices.askSize[i],
                bid: prices.bid[i],
                bidSize: prices.bidSize[i],
                mid: prices.mid[i],
                last: prices.last[i],
                change: prices.change[i],
                changepct: prices.changepct[i],
                volume: prices.volume[i],
                updated: prices.updated[i],
              };
            }
            set((state) => {
              Object.keys(updatedPrices).forEach((symbol) => {
                state.market[symbol] = updatedPrices[symbol];
              });
            });
          },
          updateOptionPrices(prices) {
            const updatedPrices = prices.reduce((result, price) => {
              result[price.optionSymbol[0]] = {
                underlying: price.underlying[0],
                expiration: price.expiration[0],
                side: price.side[0],
                strike: price.strike[0],
                dte: price.dte[0],
                updated: price.updated[0],
                bid: price.bid[0],
                bidSize: price.bidSize[0],
                mid: price.mid[0],
                ask: price.ask[0],
                askSize: price.askSize[0],
                last: price.last[0],
                openInterest: price.openInterest[0],
                volume: price.volume[0],
                inTheMoney: price.inTheMoney[0],
                intrinsicValue: price.intrinsicValue[0],
                extrinsicValue: price.extrinsicValue[0],
                underlyingPrice: price.underlyingPrice[0],
                iv: price.iv && price.iv[0],
                delta: price.delta && price.delta[0],
                gamma: price.gamma && price.gamma[0],
                theta: price.theta && price.theta[0],
                vega: price.vega && price.vega[0],
                rho: price.rho && price.rho[0],
              };
              return result;
            }, {});

            set((state) => {
              Object.keys(updatedPrices).forEach((symbol) => {
                state.market.options[symbol] = updatedPrices[symbol];
              });
            });
          },
          updateStrategyMetrics(strategy, key, value) {
            console.log('update-strategy-metrics', strategy, key, value);
            set((state) => {
              state.strategies[strategy].metrics = state.strategies[strategy].metrics || {};
              state.strategies[strategy].metrics[key] = value;
            });
          },
          updateStrategy(id, changes) {
            set((state) => {
              merge(state.strategies[id], changes);
            });
          },
          updateRollover(data) {
            set((state) => {
              const strategy = state.strategies[data.id];
              strategy.option.price = data.option.price;
              strategy.option.iv = data.option.iv;
              if (data.option.dte) {
                strategy.option.dte = data.option.dte;
              } else {
                strategy.option.dte = Math.floor(DateTime.fromISO(strategy.option.expiration).diffNow('days').toHuman());
              }
              if (data.option.inTheMoney) {
                strategy.option.inTheMoney = data.option.inTheMoney;
              } else {
                strategy.option.inTheMoney = strategy.growth.price >= strategy.option.strike;
              }

              strategy.option.buybackPrice = data.option.price * strategy.option.qty * 100 + strategy.option.premium_bonus;

              strategy.option.greeks = {
                delta: data.option.delta,
                gamma: data.option.gamme,
                theta: data.option.theta,
                vega: data.option.vega,
                rho: data.option.rho,
              };

              strategy.cycle.rollover.premium = data.rollover.premium;
              strategy.cycle.rollover.bonus = data.rollover.bonus || 0.0;
              strategy.cycle.rollover.strike = data.rollover.strike;
              strategy.cycle.rollover.qty = data.rollover.qty || strategy.option.qty;
              strategy.cycle.rollover.expiration = data.rollover.expiration;
            });
          },
          updateDistribution(data) {
            set((state) => {
              const strategy = state.strategies[data.id];
              strategy.dividend.distribution = data.dividend.distribution;
              strategy.dividend.date = data.dividend.date;
            });
          },
        };
      })
    )
  );

  return store;
}
