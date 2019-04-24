import * as firebaseFunctionsTest from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { updateFn, firestore } from './firebase-stubs';

const test = firebaseFunctionsTest();

jest.spyOn(admin, 'initializeApp');

//jest.spyOn(admin, 'firestore' as any, 'get').mockReturnValue(() => firestore);
// jest.mock('firebase-admin', () => require('./firebase-mock-sdk').mocksdk);

const receiptStateUpdater = test.wrap(require('../src').receiptStateUpdater);

beforeEach(() => {
  updateFn.mockClear();
});

describe('Receipt state updater cloud function (offline)', () => {
  it('should not do anything if result data is absent', async () => {
    const refPath = 'receiptsByUser/testUserId/receipts/test-receipt.jpg';

    const before = test.firestore.makeDocumentSnapshot({}, refPath);
    const after = test.firestore.makeDocumentSnapshot(
      {
        downloadURL: 'bar',
      },
      refPath
    );
    const change = test.makeChange(before, after);
    Object.defineProperty(admin, 'firestore', { get: () => firestore });
    await receiptStateUpdater(change, {
      params: {
        userId: 'testUserId',
        receiptId: 'test-receipt.jpg',
      },
    });
    expect(updateFn).not.toHaveBeenCalled();
  });
});
