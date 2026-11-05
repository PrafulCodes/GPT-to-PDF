import assert from 'node:assert/strict';
import test from 'node:test';
import { getPrismaErrorCode, isTransientPrismaError } from './index';

test('classifies Prisma pool exhaustion as transient', () => {
  const error = { code: 'P2024', message: 'pool timeout' };

  assert.equal(getPrismaErrorCode(error), 'P2024');
  assert.equal(isTransientPrismaError(error), true);
});

test('does not classify permanent Prisma errors as transient', () => {
  const error = { code: 'P2002', message: 'unique constraint' };

  assert.equal(getPrismaErrorCode(error), 'P2002');
  assert.equal(isTransientPrismaError(error), false);
});
