import * as firebaseFunctionsTest from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { updateFn, firestore } from './firebase-stubs';
import * as extractor from '@dexpenses/extract/lib/pipeline';

const test = firebaseFunctionsTest();

jest.spyOn(admin, 'initializeApp');

const receiptStateUpdater = test.wrap(require('../src').receiptStateUpdater);

describe('Receipt state updater cloud function (offline)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    /**
     * test.firestore.makeDocumentSnapshot and test.makeChange
     * require actual firestore instance
     */
    jest.spyOn(admin, 'firestore' as any, 'get').mockRestore();
    jest.spyOn(extractor, 'isReady').mockRestore();
  });

  it.each([
    ['result is absent', {}, { downloadURL: 'foo.me' }],
    ['result data is absent', {}, { result: { state: 'error' } }],
    [
      'result state is not ready and not partial',
      {},
      { result: { state: 'error', data: {} } },
    ],
    [
      'result state did not change',
      { result: { data: {}, state: 'partial' } },
      { result: { data: {}, state: 'partial' } },
    ],
  ] as any[])('should not do anything if %s', async (name, before, after) => {
    await changeEvent({
      before,
      after,
    });
    expect(updateFn).not.toHaveBeenCalled();
  });

  it('should update state if receipt becomes ready', async () => {
    jest.spyOn(extractor, 'isReady').mockReturnValue(true);

    await changeEvent({
      before: {},
      after: { result: { data: {}, state: 'partial' } },
    });
    expect(updateFn).toHaveBeenCalledWith({ 'result.state': 'ready' });
  });

  it('should update state if receipt becomes partial', async () => {
    jest.spyOn(extractor, 'isReady').mockReturnValue(false);

    await changeEvent({
      before: {},
      after: { result: { data: {}, state: 'ready' } },
    });

    expect(updateFn).toHaveBeenCalledWith({ 'result.state': 'partial' });
  });

  async function changeEvent(e: { before: any; after: any }) {
    const refPath = 'receiptsByUser/testUserId/receipts/test-receipt.jpg';

    const before = test.firestore.makeDocumentSnapshot(e.before, refPath);
    const after = test.firestore.makeDocumentSnapshot(e.after, refPath);
    const change = test.makeChange(before, after);
    jest
      .spyOn(admin, 'firestore' as any, 'get')
      .mockReturnValue(() => firestore);
    await receiptStateUpdater(change, {
      params: {
        userId: 'testUserId',
        receiptId: 'test-receipt.jpg',
      },
    });
  }
});
