import * as fbTest from 'firebase-functions-test';

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

describe.each(Object.entries(require('./kpis')))(
  'KPI function %s',
  (name, actualFunc: any) => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return the correct shape', async () => {
      const func = test.wrap(actualFunc);
      await expect(func({}, { auth: { uid: 'test' } })).resolves.toHaveProperty(
        'value'
      );
    });
  }
);
