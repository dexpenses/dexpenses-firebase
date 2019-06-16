import * as firebaseFunctionsTest from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import * as pubsub from '@google-cloud/pubsub';
import * as fs from 'fs';
import * as path from 'path';
import { firestore, firestoreDb } from './firebase-stubs';

/*
 * Skip Geo Coding API call during testing
 */
jest.mock('../src/extract/extractor/place', () => {
  return {
    PlaceExtractor: jest.fn().mockImplementation(() => ({
      field: 'place',
      extract: () => null,
    })),
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

const testSuites: Record<string, string[]> = {
  general: [],
};

const testRoot = __dirname;
const dir = path.resolve(testRoot, 'data');
for (const entry of fs.readdirSync(dir)) {
  const entry_path = path.resolve(dir, entry);
  if (fs.statSync(entry_path).isDirectory()) {
    testSuites[path.basename(entry_path)] = fs
      .readdirSync(entry_path)
      .filter((f) => f.endsWith('.txt'))
      .map((f) => path.resolve(entry_path, f));
  } else if (entry.endsWith('.txt')) {
    testSuites.general.push(entry_path);
  }
}

// TODO use describe.each and it.each
for (const [suite, files] of Object.entries(testSuites)) {
  describe(`Extract receipt cloud function (offline) for "${suite}" receipts`, () => {
    for (const textFile of files) {
      if (!textFile.endsWith('.txt')) {
        continue;
      }
      it(`should successfully extract info from '${path.basename(
        textFile
      )}'`, async () => {
        const text = fs.readFileSync(textFile, 'utf8');
        const receiptId = textFile.replace(/\.txt$/, '.jpg');
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
        expect(result.data()).toMatchSnapshot();
      });
    }
  });
}
