import { microStrategyStockExpert } from './microstrategy-stock-expert';

export async function produceAgentResponse(ws, request, context) {
  switch (request.agent) {
    case 'microstrategy-stock-expert':
      const response = await microStrategyStockExpert(request, context);
      ws.send(JSON.stringify({ type: 'agent-response', response }));
  }
}
