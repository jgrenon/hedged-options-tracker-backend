import { isEqual, map } from 'lodash';

export function lostCapitalGain({ store }) {
  return store.subscribe(
    (state) => state.strategies,
    (strategies) => {
      map(strategies, (strategy, id) => {
        const lostCapitalGain = {
          value: (strategy.growth.price - strategy.option.strike) * strategy.option.qty * 100,
        };

        if (!isEqual(strategy.metrics.LOST_CAPITAL_GAIN, lostCapitalGain)) {
          store.getState().updateStrategyMetrics(id, 'LOST_CAPITAL_GAIN', lostCapitalGain);
        }
      });
    }
  );
}
