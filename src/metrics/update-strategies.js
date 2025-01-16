import { map } from 'lodash';

export function updateStrategy({ store }) {
  console.log('registering update-strategy metric');

  return store.subscribe(
    (state) => [state.market, state.strategies],
    ([market, strategies]) => {
      map(strategies, (strategy, id) => {
        const prices = {
          growth: {
            price: market[strategy.growth.symbol]?.ask,
          },
          dividend: {
            price: market[strategy.dividend.symbol]?.ask,
          },
        };

        console.log('updating strategy price', id, prices);
        store.getState().updateStrategy(id, prices);
      });
    },
    {
      invalidate: ['$[0].*.ask'],
    }
  );
}
