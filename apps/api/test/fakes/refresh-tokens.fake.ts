import { randomUUID } from 'node:crypto';
import { FindOperator, type Repository } from 'typeorm';
import type { RefreshToken } from '../../src/modules/auth/entities/refresh-token.entity.js';

// An in-memory stand-in for Repository<RefreshToken>, covering what AuthService uses,
// with IsNull() honoured in where clauses
export function fakeRefreshTokens() {
  const rows = new Map<string, RefreshToken>();
  const matches = (row: RefreshToken, where: Record<string, unknown>) =>
    Object.entries(where).every(([key, value]) => {
      const actual = row[key as keyof RefreshToken];
      return value instanceof FindOperator ? value.type === 'isNull' && actual == null : actual === value;
    });

  const fake = {
    rows,
    create: (data: Partial<RefreshToken>) => ({ ...data }),
    save: async (data: Partial<RefreshToken>) => {
      const row = { id: randomUUID(), revokedAt: null, createdAt: new Date(), ...data } as RefreshToken;
      rows.set(row.id, row);
      return row;
    },
    update: async (where: Record<string, unknown>, patch: Partial<RefreshToken>) => {
      let affected = 0;
      for (const row of rows.values()) {
        if (matches(row, where)) {
          Object.assign(row, patch);
          affected++;
        }
      }
      return { affected };
    },
    findOneBy: async (where: Record<string, unknown>) => [...rows.values()].find((row) => matches(row, where)) ?? null,
  };

  return fake as typeof fake & Repository<RefreshToken>;
}
