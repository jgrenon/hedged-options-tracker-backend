import Yaml from 'js-yaml';
import Path from 'node:path';

export function rolloverLoader(events, { store }) {
  events.subscribe(async function ({ event, filename }) {
    if (filename === 'rollover.yaml') {
      const data = Yaml.load(await Bun.file(Path.resolve('data', filename)).text());
      store.getState().updateRollover(data);
    }
  });
}
