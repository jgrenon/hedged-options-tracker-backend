import Yaml from 'js-yaml';
import Path from 'node:path';

export function historyMonthlyStats(events, { store }) {
  events.subscribe(async function ({ event, filename }) {
    console.log('looking for history', filename);
    if (filename.indexOf('cycles/') === 0) {
      console.log('processing historical cycle', filename);
    }
  });
}
