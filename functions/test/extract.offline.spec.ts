import * as firebaseFunctionsTest from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import * as pubsub from '@google-cloud/pubsub';
import { firestore, firestoreDb } from './firebase-stubs';
import extractorPipeline, { Config } from '@dexpenses/extract';
import { UserData } from '@dexpenses/core';

const mockExtractorPipeline = jest.fn();
jest.mock('@dexpenses/extract', () => {
  return {
    default: ((c: Config) => (ud: UserData) =>
      mockExtractorPipeline) as typeof extractorPipeline,
  };
});

const test = firebaseFunctionsTest();

const initializeAppStub = jest.spyOn(admin, 'initializeApp');
const firestoreStub = jest
  .spyOn(admin, 'firestore' as any, 'get')
  .mockReturnValue(() => firestore);
const extractReceipt = test.wrap(require('../src').extractReceipt);
initializeAppStub.mockRestore();

jest.mock('@google-cloud/pubsub');
pubsub.PubSub.prototype.topic = jest.fn().mockReturnValue({
  publishJSON: jest.fn().mockImplementation((json) => json),
});

const userId = test.auth.exampleUserRecord().uid;

firestoreDb[`users/${userId}`] = {
  phoneNumber: '+491234567890',
};

afterAll(() => {
  firestoreStub.mockRestore();
  (pubsub.PubSub.prototype.topic as any).mockRestore();
});

describe(`Extract receipt cloud function (offline)`, () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExtractorPipeline.mockResolvedValue({ state: 'ready' });
  });

  const text = `
  some receipt
  `;
  const receiptId = 'some-receipt.jpg';

  it(`should save result and publish tagging msg after successful extraction`, async () => {
    await extractReceipt({
      json: {
        text,
        userId,
        fileName: receiptId,
      },
    });
    const result = firestore
      .collection('receiptsByUser')
      .doc(userId)
      .collection('receipts')
      .doc(receiptId)
      .get();
    expect(result.exists).toBeTruthy();
    expect(result.data()).toEqual({ result: { state: 'ready' } });

    expect(pubsub.PubSub.prototype.topic).toHaveBeenCalledWith('tagging');
    expect(
      pubsub.PubSub.prototype.topic('tagging').publishJSON
    ).toHaveBeenCalledWith({
      userId,
      receiptId,
      result: { state: 'ready' },
    });
  });

  it(`should save result but not publish tagging msg after erroneous extraction`, async () => {
    mockExtractorPipeline.mockResolvedValue({ state: 'error' });
    await extractReceipt({
      json: {
        text,
        userId,
        fileName: receiptId,
      },
    });
    const result = firestore
      .collection('receiptsByUser')
      .doc(userId)
      .collection('receipts')
      .doc(receiptId)
      .get();
    expect(result.exists).toBeTruthy();
    expect(result.data()).toEqual({ result: { state: 'error' } });

    expect(pubsub.PubSub.prototype.topic).not.toHaveBeenCalled();
    expect(
      pubsub.PubSub.prototype.topic('tagging').publishJSON
    ).not.toHaveBeenCalled();
  });
});
