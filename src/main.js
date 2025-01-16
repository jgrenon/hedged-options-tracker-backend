import { storeFactory } from './store';
import { marketFactory } from './market';
import * as metrics from './metrics';
import { nanoid } from 'nanoid';
import { map, remove } from 'lodash';
import { produceAgentResponse } from './agents/produce-agent-response';
import { watch } from 'fs';
import { EndlessSubject } from 'rxmq';
import * as loaders from './loaders';

const market = marketFactory();
const store = storeFactory('./data/strategies.yaml');

const fileEvents = new EndlessSubject();

const context = { market, store, clients: [] };

watch('./data', (event, filename) => {
  fileEvents.next({ event, filename });
});
Object.values(loaders).map((loader) => loader(fileEvents, context));

// connect all metrics
Object.values(metrics).map((metric) => metric({ store, market }));

// trigger loaders
fileEvents.next({ event: 'change', filename: 'rollover.yaml' });
fileEvents.next({ event: 'change', filename: 'dividend.yaml' });

// Open the websocket server
Bun.serve({
  port: 8080,
  fetch(req, server) {
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
