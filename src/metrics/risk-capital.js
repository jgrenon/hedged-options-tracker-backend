import { isEqual, map } from 'lodash';

export function riskCapital({ store }) {
  return store.subscribe(
    (state) => state.strategies,
    (strategies) => {
      map(strategies, (strategy, id) => {
        const riskCapital = {
          value: strategy.growth.units * strategy.growth.price + (strategy.dividend.units - strategy.cycle.extra_div_qty) * strategy.dividend.price,
          cost: strategy.growth.units * strategy.growth.cost + (strategy.dividend.units - strategy.cycle.extra_div_qty) * strategy.dividend.cost,
        };

        riskCapital.delta =
          strategy.growth.units * strategy.growth.price + (strategy.dividend.units - strategy.cycle.extra_div_qty) * strategy.dividend.price - (strategy.growth.units * strategy.growth.cost + (strategy.dividend.units - strategy.cycle.extra_div_qty) * strategy.dividend.cost);

        if (!isEqual(strategy.metrics.RISK_CAPITAL, riskCapital)) {
          store.getState().updateStrategyMetrics(id, 'RISK_CAPITAL', riskCapital);
        }
      });
    },
    {
      invalidate: ['$[*].growth.price', '$[*].dividend.price'],
    }
  );
}
