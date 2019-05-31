import * as bigQueryFunctions from './index';
import { BigQuery } from '@google-cloud/bigquery';
import * as mockDate from 'jest-date-mock';

jest.mock('@google-cloud/bigquery', () => {
  const BigQuery = class {
    query() {}
  };
  BigQuery.prototype.query = jest.fn().mockResolvedValue([[{ value: 1 }]]);
  return {
    BigQuery,
  };
});
jest.mock('../https', () => ({
  onAuthenticatedCall: (handler) => handler,
}));

const testData = {
  aggregateTotalOverTimePeriod: {
    period: 'yearly',
    start: '2018-01-01',
    end: '2019-12-31 23:59:59.999999',
  },
  findByBoundingBox: {
    southWest: {
      lng: 0,
      lat: 1,
    },
    northEast: {
      lng: 2,
      lat: 3,
    },
  },
};

describe.each(Object.entries(bigQueryFunctions))(
  'bigQueryFunction %s',
  (name, func: any) => {
    beforeEach(() => {
      (BigQuery.prototype.query as any).mockClear();
      mockDate.advanceTo(new Date(2019, 0, 1, 0, 0, 0, 0));
    });

    it('should generate the correct SQL', async () => {
      expect.assertions(2);
      try {
        await func(testData[name] || {}, { auth: { uid: 'test' } });
      } catch {
        fail(`invocation should not fail`);
      }
      expect(BigQuery.prototype.query).toHaveBeenCalledTimes(1);
      expect(BigQuery.prototype.query).toMatchSnapshot();
    });
  }
);
