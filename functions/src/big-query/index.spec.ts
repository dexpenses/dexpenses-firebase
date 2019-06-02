import * as fbTest from 'firebase-functions-test';

const test = fbTest();

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

describe.each(Object.entries(require('./index')))(
  'bigQueryFunction %s',
  (name, actualFunc: any) => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockDate.advanceTo(new Date('2019-01-01T00:00:00.000Z'));
    });

    it('should generate the correct SQL', async () => {
      const func = test.wrap(actualFunc);
      await expect(
        func(testData[name] || {}, { auth: { uid: 'test' } })
      ).resolves.toBeDefined();
      expect(BigQuery.prototype.query).toHaveBeenCalledTimes(1);
      expect(BigQuery.prototype.query).toMatchSnapshot();
    });
  }
);
