import * as fbTest from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import dataset from '../../src/export/big-query/dataset';
import * as mockDate from 'jest-date-mock';
import { ReceiptRecord } from '../../src/model';

const test = fbTest();

mockDate.advanceTo('2019-01-01T00:00:00.000Z');

jest.spyOn(admin, 'initializeApp');

jest.mock('../../src/export/big-query/dataset', () => ({
  default: {
    table: jest.fn().mockReturnValue({
      insert: jest.fn(),
    }),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Export receipts to BigQuery (offline)', () => {
  it('should create insert', async () => {
    const receiptsToBigQuery = test.wrap(
      require('../../src').exportBigQueryReceipts
    );

    const refPath = 'receiptsByUser/testUserId/receipts/test-recept.jpg';
    const before = test.firestore.makeDocumentSnapshot({}, refPath);
    const receiptRecord: ReceiptRecord = {
      downloadUrl: 'download.me',
      result: {
        state: 'ready',
        data: {
          header: ['header'],
          amount: {
            value: 1,
            currency: 'EUR',
          },
          timestamp: new Date(),
          paymentMethod: 'CASH',
          place: {
            geometry: {
              location: {
                lat: 1,
                lng: 2,
              },
            },
          } as any,
        },
      },
      tags: ['tag'],
    };
    const after = test.firestore.makeDocumentSnapshot(receiptRecord, refPath);
    const change = test.makeChange(before, after);
    await receiptsToBigQuery(change, {
      params: {
        userId: 'testUserId',
        receiptId: 'test-receipt.jpg',
      },
    });
    expect(dataset.table).toHaveBeenCalledTimes(1);
    expect(dataset.table).toHaveBeenCalledWith('receipts');
    expect(dataset.table('receipts').insert).toMatchSnapshot();
  });
});
