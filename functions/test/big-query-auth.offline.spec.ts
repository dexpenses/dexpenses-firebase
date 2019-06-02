import * as fbTest from 'firebase-functions-test';
import { BigQuery } from '@google-cloud/bigquery';

const test = fbTest();

jest.mock('@google-cloud/bigquery', () => {
  const BigQuery = class {
    query() {}
  };
  BigQuery.prototype.query = jest.fn().mockResolvedValue([[{ value: 1 }]]);
  return {
    BigQuery,
  };
});

describe.each(Object.entries(require('../src/big-query')))(
  'bigQueryFunction %s',
  (name, actualFunc: any) => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should error on unauthenticated call', async () => {
      const func = test.wrap(actualFunc);
      await expect(func({}, { auth: null })).rejects.toThrowError(
        /authenticated/
      );
      expect(BigQuery.prototype.query).not.toHaveBeenCalled();
    });
  }
);
