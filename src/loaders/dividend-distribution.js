import Yaml from 'js-yaml';
import Path from 'node:path';

export function dividendDistributionLoader(events, { store }) {
  events.subscribe(async function ({ event, filename }) {
    if (filename === 'dividend.yaml') {
      const data = Yaml.load(await Bun.file(Path.resolve('data', filename)).text());
      console.log('updating distribution data', event, data);
      store.getState().updateDistribution(data);
    }
  });
}
