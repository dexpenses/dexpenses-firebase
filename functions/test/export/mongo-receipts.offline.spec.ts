import * as fbTest from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import * as mockDate from 'jest-date-mock';
import mongo from '../../src/mongo';
import { ReceiptRecord } from '../../src/model';
import { MongoReceipt } from '../../src';

const test = fbTest();

mockDate.advanceTo('2019-01-01T00:00:00.000Z');

jest.spyOn(admin, 'initializeApp');

jest.mock('../../src/mongo');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Export receipts to mongo (offline)', () => {
  it('should create insert', async () => {
    const exportMongoReceipts = test.wrap(
      require('../../src').exportMongoReceipts
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
    await exportMongoReceipts(change, {
      params: {
        userId: 'testUserId',
        receiptId: 'test-receipt.jpg',
      },
    });
    expect((mongo as any).__mockDb__.collection).toHaveBeenCalledWith(
      'receipts'
    );
    expect((mongo as any).__mockCollection__.updateOne).toHaveBeenCalledWith(
      {
        _id: {
          user: 'testUserId',
          receipt: 'test-receipt.jpg',
        },
      },
      {
        _id: {
          user: 'testUserId',
          receipt: 'test-receipt.jpg',
        },
        amount: {
          value: 1,
          currency: 'EUR',
        },
        header: ['header'],
        location: {
          type: 'Point',
          coordinates: [2, 1],
        },
        paymentMethod: 'CASH',
        state: 'ready',
        tags: ['tag'],
        timestamp: new Date(),
      } as MongoReceipt,
      { upsert: true }
    );
  });
});
