import {
  AnalyzeOffer,
  CalculateSimulation,
  CheckSharedSimulation,
  GetSharedSimulation,
  ShareSimulation,
} from '../../application';
import { FakeRateLimiter } from '../../application/testing/FakeRateLimiter';
import { FixedClock } from '../../application/testing/FixedClock';
import { InMemorySimulationRepository } from '../../application/testing/InMemorySimulationRepository';
import { SequenceIdGenerator } from '../../application/testing/SequenceIdGenerator';
import { createApp } from '../createApp';
import type { AppServices } from '../types';
import { FakeAssets } from './FakeAssets';

/** Relógio de referência dos testes: 15/11/2026 12:00 UTC. */
export const START_TIME = new Date('2026-11-15T12:00:00.000Z');

/** Ids válidos que o gerador fake entrega, na ordem. */
export const SHARE_IDS = ['aB3dE5fG7h', 'Kl9mN1pQ3r', 'St5uV7wX9y'] as const;

/** Monta o app com os casos de uso reais sobre fakes em memória. */
export function createTestHarness(overrides: Partial<AppServices> = {}) {
  const repository = new InMemorySimulationRepository();
  const clock = new FixedClock(START_TIME);
  const limiter = new FakeRateLimiter();
  const assets = new FakeAssets();
  const services: AppServices = {
    calculateSimulation: new CalculateSimulation(),
    analyzeOffer: new AnalyzeOffer(),
    shareSimulation: new ShareSimulation(repository, new SequenceIdGenerator(SHARE_IDS), clock),
    getSharedSimulation: new GetSharedSimulation(repository, clock),
    checkSharedSimulation: new CheckSharedSimulation(repository, clock),
    shareLimiter: limiter,
    assets,
    ...overrides,
  };
  const app = createApp<Record<string, unknown>>(() => services);
  return { app, repository, clock, limiter, assets };
}

export type TestApp = ReturnType<typeof createTestHarness>['app'];

/** POST com corpo JSON. */
export function postJson(
  app: TestApp,
  path: string,
  body: unknown,
  headers: Readonly<Record<string, string>> = {},
): Promise<Response> {
  return Promise.resolve(
    app.request(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify(body),
    }),
  );
}

/** GET simples. */
export function get(app: TestApp, path: string): Promise<Response> {
  return Promise.resolve(app.request(path));
}
