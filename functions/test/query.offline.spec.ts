import * as fbTest from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as mockDate from 'jest-date-mock';
import { QueryHandler } from '../src/query/contract/QueryContract';

mockDate.advanceTo('2019-01-01T00:00:00.000Z');

const test = fbTest();

jest.spyOn(admin, 'initializeApp');
jest.spyOn(functions, 'config').mockReturnValue({});

const mockQueryContract = {
  aggregateAverageTotal: jest.fn(),
  aggregateTotal: jest.fn(),
  aggregateTotalOverTimePeriod: jest.fn(),
  findByBoundingBox: jest.fn(),
  groupByPaymentMethod: jest.fn(),
  groupByTags: jest.fn(),
};
jest.mock('../src/query/mongo-queries', () => ({
  default: new QueryHandler(mockQueryContract),
}));

let query;
beforeEach(() => {
  jest.clearAllMocks();
  query = test.wrap(require('../src').query);
});

describe('query function', () => {
  it('should throw error if name is missing or blank', async () => {
    await expect(
      query(
        {},
        {
          auth: {
            uid: 'test',
          },
        }
      )
    ).rejects.toThrowError(/name/);
    await expect(
      query(
        { name: '' },
        {
          auth: {
            uid: 'test',
          },
        }
      )
    ).rejects.toThrowError(/name/);

    await expect(
      query(
        { name: '  ' },
        {
          auth: {
            uid: 'test',
          },
        }
      )
    ).rejects.toThrowError(/name/);
  });

  it('should throw error if query name is unknown', async () => {
    await expect(
      query(
        { name: 'bogus' },
        {
          auth: {
            uid: 'test',
          },
        }
      )
    ).rejects.toThrowError(/name/);
  });

  const timeSpanParams = {
    userId: 'test',
    start: new Date(0),
    end: new Date(),
  };
  const bounds = {
    southWest: {
      lng: 0,
      lat: 0,
    },
    northEast: {
      lng: 0,
      lat: 0,
    },
  };

  it.each([
    ['aggregateTotal', {}, timeSpanParams],
    ['aggregateAverageTotal', {}, timeSpanParams],
    ['findByBoundingBox', bounds, { ...timeSpanParams, ...bounds }],
    ['groupByTags', {}, timeSpanParams],
    ['groupByPaymentMethod', {}, timeSpanParams],
    [
      'aggregateTotalOverTimePeriod',
      { period: 'year', start: new Date(0), end: new Date() },
      { period: 'year', ...timeSpanParams },
    ],
  ] as any[][])(
    'should call %s with correct parsed params',
    async (queryName, params, expectedParsedParams) => {
      await expect(
        query(
          { name: queryName, params },
          {
            auth: {
              uid: 'test',
            },
          }
        )
      ).resolves.toBeUndefined();

      expect(mockQueryContract[queryName as string]).toHaveBeenCalledWith(
        expectedParsedParams
      );
    }
  );
});
