import { isEqual, map } from 'lodash';

export function optionRollOver({ store }) {
  return store.subscribe(
    (state) => state.strategies,
    (strategies) => {
      map(strategies, (strategy, id) => {
        const optionRollOver = {
          value: strategy.option.price * strategy.option.qty * 100 + strategy.option.premium_bonus,
        };

        optionRollOver.growthGain = (strategy.cycle.rollover.strike - strategy.option.strike) * strategy.option.qty * 100;

        // number of dividend units to sell
        optionRollOver.divUnitsToSell = Math.floor((optionRollOver.value - strategy.cycle.cash_balance) / strategy.dividend.price);

        // premium from new option contracts
        optionRollOver.newPremium = strategy.cycle.rollover.premium * strategy.cycle.rollover.qty * 100 + strategy.cycle.rollover.bonus;
        optionRollOver.newDivUnits = Math.floor(optionRollOver.newPremium / strategy.dividend.price);
        optionRollOver.deltaDivUnits = optionRollOver.newDivUnits - optionRollOver.divUnitsToSell;
        optionRollOver.divUnitsBalance = strategy.dividend.units - optionRollOver.divUnitsToSell + optionRollOver.newDivUnits;
        optionRollOver.gain = optionRollOver.newPremium - optionRollOver.value + optionRollOver.growthGain;

        if (!isEqual(strategy.metrics.ROLLOVER, optionRollOver)) {
          console.log('ROLLOVER METRIC', optionRollOver);
          store.getState().updateStrategyMetrics(id, 'ROLLOVER', optionRollOver);
        }
      });
    }
  );
}
