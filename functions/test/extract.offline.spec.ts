import * as firebaseFunctionsTest from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import * as pubsub from '@google-cloud/pubsub';
import { firestore, firestoreDb } from './firebase-stubs';

/*
 * Skip Geo Coding API call during testing
 */
jest.mock('@dexpenses/extract', () => {
  return { default: () => jest.fn().mockReturnValue('result') };
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
  publish: jest
    .fn()
    .mockImplementation((buffer) => JSON.parse(buffer.toString())),
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
  it(`should successfully run for sample`, async () => {
    const text = `
    some receipt
    `;
    const receiptId = 'some-receipt.jpg';
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
    expect(result.data()).toEqual({ result: 'result' });
  });
});
