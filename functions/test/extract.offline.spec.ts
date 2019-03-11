import * as firebaseFunctionsTest from 'firebase-functions-test';
import * as sinon from 'sinon';
import * as admin from 'firebase-admin';
import { expect } from 'chai';
import 'mocha';
import * as fs from 'fs';
import * as path from 'path';
import fakeFirestore from './firestore-stub';

const test = firebaseFunctionsTest();

sinon.stub(admin, 'initializeApp');
sinon.stub(admin, 'firestore').get(() => () => fakeFirestore);
const analyzeReceiptText = test.wrap(require('../src').analyseReceiptText);
(admin.initializeApp as any).restore();

const userId = test.auth.exampleUserRecord().uid;

describe('Analyze receipt text Cloud Function (offline)', () => {
  const testRoot = __dirname;
  const dir = path.resolve(testRoot, 'data');
  const testFiles = fs.readdirSync(dir);

  after(() => {
    if ((admin.firestore as any).restore) {
      (admin.firestore as any).restore();
    }
  });

  for (const textFile of testFiles) {
    it(`should be successfully extract info from '${textFile}'`, () => {
      const text = fs.readFileSync(path.resolve(dir, textFile), 'utf8');
      const result = analyzeReceiptText(
        {
          data() {
            return {
              text,
            };
          },
        },
        {
          params: {
            userId,
            receiptId: textFile.replace(/\.txt$/, '.jpg'),
          },
        }
      );
      const expected = JSON.parse(
        fs.readFileSync(
          path.resolve(
            testRoot,
            'expected',
            textFile.replace(/\.txt$/, '.json')
          ),
          'utf8'
        )
      );
      expect(JSON.parse(JSON.stringify(result))).to.deep.equal({
        result: expected,
      });
    });
  }
});
