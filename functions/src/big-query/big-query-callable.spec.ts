import bigQueryCallable, {
  BigQueryFunction,
  ResultTransformers,
  Validate,
} from './big-query-callable';
import { BigQuery } from '@google-cloud/bigquery';

jest.mock('@google-cloud/bigquery', () => {
  const BigQuery = class {
    query() {}
  };
  BigQuery.prototype.query = jest.fn().mockResolvedValue([]);
  return {
    BigQuery,
  };
});
jest.mock('../https', () => ({
  onAuthenticatedCall: (handler) => handler,
}));

function mockBigQueryCallable(def: BigQueryFunction) {
  return bigQueryCallable(def) as any;
}

describe('bigQueryCallable', () => {
  beforeEach(() => {});

  it('should use constant query', async () => {
    await mockBigQueryCallable({ query: 'select * from table' })(
      {},
      { auth: { uid: 'test' } }
    );

    expect(BigQuery.prototype.query).toHaveBeenLastCalledWith({
      query: 'select * from table',
    });
  });

  it('should use query factory method', async () => {
    await mockBigQueryCallable({
      query(data) {
        return `select * from ${data.table}`;
      },
    })({ table: 'user_table' });
    expect(BigQuery.prototype.query).toHaveBeenLastCalledWith({
      query: 'select * from user_table',
    });
  });

  it('should use parseParams method', async () => {
    await mockBigQueryCallable({
      parseParams: (data, context) => ({
        foo: data.foo,
        user_id: context.auth.uid,
      }),
      query: 'select * from table',
    })({ foo: 'bar' }, { auth: { uid: 'test' } });
    expect(BigQuery.prototype.query).toHaveBeenLastCalledWith({
      query: 'select * from table',
      params: { user_id: 'test', foo: 'bar' },
    });
  });

  it('should call specified validator', async () => {
    const validate = jest.fn();
    await mockBigQueryCallable({
      query: 'select 1',
      validate,
    })({}, { auth: { uid: 'test' } });
    expect(validate).toHaveBeenCalled();
  });

  it('should call specified result transformer', async () => {
    const resultTransformer = jest.fn();
    await mockBigQueryCallable({ query: 'select 1', resultTransformer })(
      {},
      { auth: { uid: 'test' } }
    );
    expect(resultTransformer).toHaveBeenCalled();
  });
});

describe('ResultTransformers.SINGLE_VALUE', () => {
  it('should throw error on an empty result', () => {
    expect(() =>
      ResultTransformers.SINGLE_VALUE(undefined as any)
    ).toThrowError();
    expect(() => ResultTransformers.SINGLE_VALUE([])).toThrowError();
  });

  it('should throw error on multiple results', () => {
    expect(() => ResultTransformers.SINGLE_VALUE([{}, {}])).toThrowError();
  });

  it('should throw error on multiple columns', () => {
    expect(() =>
      ResultTransformers.SINGLE_VALUE([{ c0: 0, c1: 0 }])
    ).toThrowError();
  });
});

describe('Validate.required', () => {
  it('should throw for undefined', () => {
    expect(() => Validate.required({}, 'foo')).toThrowError();
    expect(() => Validate.required({ foo: undefined }, 'foo')).toThrowError();
  });

  it('should throw for null', () => {
    expect(() => Validate.required({ foo: null }, 'foo')).toThrowError();
  });

  it('should not throw for 0', () => {
    expect(() => Validate.required({ foo: 0 }, 'foo')).not.toThrowError();
  });

  it('should not throw for an empty string', () => {
    expect(() => Validate.required({ foo: '' }, 'foo')).not.toThrowError();
  });

  // what about NaN ?
});
