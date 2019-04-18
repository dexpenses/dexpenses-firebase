import * as firebaseFunctionsTest from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import * as pubsub from '@google-cloud/pubsub';
import * as fs from 'fs';
import * as path from 'path';
import { firestore } from './firebase-stubs';
import { extractorPipeline } from '../src/extract/pipeline';
import { PlaceExtractor } from '../src/extract/place';

/*
 * Skip Geo Coding API call during testing
 */
extractorPipeline.splice(
  extractorPipeline.findIndex((e) => e instanceof PlaceExtractor),
  1
);

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

describe('Analyze receipt text Cloud Function (offline)', () => {
  const testRoot = __dirname;
  const dir = path.resolve(testRoot, 'data');
  const testFiles = fs.readdirSync(dir);

  afterAll(() => {
    firestoreStub.mockRestore();
    (pubsub.PubSub.prototype.topic as any).mockRestore();
  });

  for (const textFile of testFiles) {
    if (!textFile.endsWith('.txt')) {
      continue;
    }
    it(`should be successfully extract info from '${textFile}'`, async () => {
      const text = fs.readFileSync(path.resolve(dir, textFile), 'utf8');
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
      expect(result.data).toMatchSnapshot();
    });
  }
});
