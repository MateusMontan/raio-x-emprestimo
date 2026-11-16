import { describe, expect, it } from 'vitest';
import { anOfferInput } from '../../application/testing/fixtures';
import { createTestHarness, postJson } from '../testing/harness';

describe('POST /api/v1/offers/analyze', () => {
  it('descobre a taxa implícita do critério 3 da SPEC (≈ 2,92% a.m.)', async () => {
    const { app } = createTestHarness();

    const res = await postJson(app, '/api/v1/offers/analyze', anOfferInput());

    expect(res.status).toBe(200);
    const body = await res.json<{ impliedMonthlyRate: number; cetAnnual: number }>();
    expect(body.impliedMonthlyRate).toBeCloseTo(0.0292, 3);
    expect(body.cetAnnual).toBeGreaterThan(0);
  });

  it('responde 422 com errors[] quando a parcela não é um inteiro em centavos', async () => {
    const { app } = createTestHarness();

    const res = await postJson(
      app,
      '/api/v1/offers/analyze',
      anOfferInput({ paymentCents: 50_000.5 }),
    );

    expect(res.status).toBe(422);
    const body = await res.json<{ errors: { path: string; message: string }[] }>();
    expect(body.errors[0]?.path).toBe('paymentCents');
    expect(body.errors[0]?.message).toBe('O valor da parcela deve estar em centavos inteiros.');
  });
});
