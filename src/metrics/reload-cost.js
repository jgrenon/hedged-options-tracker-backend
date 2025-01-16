import { isEqual, map } from 'lodash';

export function reloadCost({ store }) {
  return store.subscribe(
    (state) => state.strategies,
    (strategies) => {
      map(strategies, (strategy, id) => {
        const reloadCost = {
          value: 0.0,
        };

        const soldGrowthCash = strategy.option.qty * 100 * strategy.option.strike;
        const rebuyCost = strategy.option.qty * 100 * strategy.growth.price;
        reloadCost.grossIncome = strategy.dividend.units * strategy.dividend.distribution;
        reloadCost.value = rebuyCost - soldGrowthCash;
        if (reloadCost.value > 0) {
          reloadCost.netIncome = reloadCost.grossIncome - reloadCost.value;

          if (reloadCost.netIncome < 0.0) {
            reloadCost.divUnitsSold = Math.floor(Math.abs(reloadCost.netIncome) / strategy.dividend.price) + 1;
          } else {
            reloadCost.divUnitsSold = 0;
          }
        } else {
          reloadCost.netIncome = reloadCost.grossIncome;
          reloadCost.divUnitsSold = 0;
        }

        if (!isEqual(strategy.metrics.RELOAD_COST, reloadCost)) {
          store.getState().updateStrategyMetrics(id, 'RELOAD_COST', reloadCost);
        }
      });
    }
  );
}
