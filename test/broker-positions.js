import { brokerFactory } from '../src/broker';

const broker = brokerFactory('MplJo2gLM4dDBnBh3RJlqfq5VHcBiXsn0');

await broker.getAccountPositions();
