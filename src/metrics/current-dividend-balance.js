import { isEqual, map } from 'lodash';

export function dividendBalance({ store }) {
  return store.subscribe(
    (state) => state.strategies,
    (strategies) => {
      map(strategies, (strategy, id) => {
        const dividendBalance = {
          value: (strategy.dividend.units - strategy.cycle.extra_div_qty) * strategy.dividend.price + strategy.cycle.extra_div_qty * strategy.dividend.price,
          cost: (strategy.dividend.units - strategy.cycle.extra_div_qty) * strategy.dividend.cost + strategy.cycle.extra_div_qty * strategy.cycle.extra_div_cost,
        };

        dividendBalance.gain = dividendBalance.value - dividendBalance.cost;
        dividendBalance.gainPercent = (dividendBalance.value - dividendBalance.cost) / dividendBalance.cost;
        dividendBalance.startQty = strategy.dividend.units - strategy.cycle.extra_div_qty;
        dividendBalance.extraQty = strategy.cycle.extra_div_qty;
        dividendBalance.totalQty = strategy.dividend.units;
        dividendBalance.unitCost = strategy.dividend.cost;
        dividendBalance.avgCost = dividendBalance.cost / strategy.dividend.units;

        if (!isEqual(strategy.metrics.CURRENT_DIVIDEND_BALANCE, dividendBalance)) {
          console.log('computing strateegy dividend balance', id, dividendBalance);
          store.getState().updateStrategyMetrics(id, 'CURRENT_DIVIDEND_BALANCE', dividendBalance);
        }
      });
    }
  );
}
