import { isEqual, map } from 'lodash';

export function earlyBuyback({ store }) {
  return store.subscribe(
    (state) => state.strategies,
    (strategies) => {
      map(strategies, (strategy, id) => {
        const earlyBuyback = {
          value: strategy.option.buybackPrice,
        };
        earlyBuyback.divUnitsSold = Math.floor(strategy.option.buybackPrice / strategy.dividend.price);
        earlyBuyback.deltaDivUnits = strategy.cycle.extra_div_qty - earlyBuyback.divUnitsSold;

        if (!isEqual(strategy.metrics.BUYBACK, earlyBuyback)) {
          store.getState().updateStrategyMetrics(id, 'BUYBACK', earlyBuyback);
        }
      });
    }
  );
}
