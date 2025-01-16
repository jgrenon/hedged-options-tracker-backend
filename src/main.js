import { storeFactory } from './store';
import { marketFactory } from './market';
import * as metrics from './metrics';
import { nanoid } from 'nanoid';
import { remove } from 'lodash';
import { produceAgentResponse } from './agents/produce-agent-response';
import { watch } from 'fs';
import { EndlessSubject } from 'rxmq';
import * as loaders from './loaders';
import fg from 'fast-glob';

const market = marketFactory();
const store = storeFactory('./data/strategies.yaml');

const fileEvents = new EndlessSubject();

const context = { market, store, clients: [] };

watch('./data', { persistent: true, recursive: true }, (event, filename) => {
  fileEvents.next({ event, filename });
});
Object.values(loaders).map((loader) => loader(fileEvents, context));

// connect all metrics
Object.values(metrics).map((metric) => metric({ store, market }));

// trigger loaders
fileEvents.next({ event: 'change', filename: 'rollover.yaml' });
fileEvents.next({ event: 'change', filename: 'dividend.yaml' });
fg.sync('cycles/active/*.yaml', { cwd: 'data' }).map((f) => fileEvents.next({ event: 'change', filename: f }));
fg.sync('cycles/history/*.yaml', { cwd: 'data' }).map((f) => fileEvents.next({ event: 'change', filename: f }));

// Open the websocket server
Bun.serve({
  port: 8080,
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === '/health-check') {
      return new Response('ok');
    }

    // upgrade the request to a WebSocket
    if (
      server.upgrade(req, {
        data: {
          id: nanoid(),
        },
      })
    ) {
      return; // do not return a Response
    }
    return new Response('Upgrade failed', { status: 500 });
  },
  websocket: {
    message(ws, message) {
      const request = JSON.parse(message);
      console.log('received request', request);
      switch (request.type) {
        case 'agent':
          return produceAgentResponse(ws, request, context);
      }
    },
    open(ws) {
      console.log('client connected', ws.data.id);
      const unsub = store.subscribe(
        (state) => state,
        (state) => ws.send(JSON.stringify({ type: 'sync', state }))
      );
      context.clients.push({ id: ws.data.id, unsub });
      ws.send(JSON.stringify({ type: 'sync', state: store.getState() }));
    },
    close(ws) {
      remove(context.clients, { id: ws.data.id });
      const unsubscribe = context.clients.find((c) => c.id === ws.data.id);
      if (unsubscribe) {
        unsubscribe();
      }
    },
  },
});
