import { isEqual, map } from 'lodash';

function computeCappedGain(qty, cost, price, strike) {
  price = price < strike ? price : strike;
  return (price - cost) * qty * 100;
}

function computeUncappedGain(qty, price, cost) {
  return qty * (price - cost);
}

export function currentValueMetric({ store }) {
  console.log('registering current value metric');
  return store.subscribe(
    (state) => state.strategies,
    (strategies) => {
      map(strategies, (strategy, id) => {
        console.log('computing CURRENT_GAIN_CASH for strategy', id);

        const premiumCash = strategy.option.premium * strategy.option.qty * 100 + (strategy.option.premium_bonus || 0);
        const cappedGain = computeCappedGain(strategy.option.qty, strategy.growth.cost, strategy.growth.price, strategy.option.strike);
        const uncappedGain = computeUncappedGain(strategy.cycle.extra_div_qty, strategy.dividend.price, strategy.cycle.extra_div_cost);

        const cashValue = {
          total: premiumCash + cappedGain + uncappedGain + strategy.cycle.extra_div_cash + strategy.cycle.extra_cash,
          premium: premiumCash,
          capped: cappedGain,
          uncapped: uncappedGain,
          extra_income: strategy.cycle.extra_div_cash,
        };

        cashValue.delta = cashValue.total - strategy.option.buybackPrice;
        if (strategy.metrics.RISK_CAPITAL) {
          cashValue.perf = cashValue.delta / strategy.metrics.RISK_CAPITAL?.cost;
        }

        if (!isEqual(cashValue, strategy.metrics.CURRENT_GAIN_CASH)) {
          store.getState().updateStrategyMetrics(id, 'CURRENT_GAIN_CASH', cashValue);
        }
      });
    }
  );
}
