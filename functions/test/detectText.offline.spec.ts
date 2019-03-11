import * as fbTest from 'firebase-functions-test';
import * as sinon from 'sinon';
import * as admin from 'firebase-admin';
import * as vision from '@google-cloud/vision';
import fakeFirestore from './firestore-stub';
import { expect } from 'chai';
import 'mocha';

const bucket = 'test-bucket';

const test = fbTest();

const fakeStorage = {
  bucket() {
    return {
      file(name) {
        return {
          delete: sinon.stub().resolves(),
        };
      },
    };
  },
};

sinon.stub(admin, 'initializeApp');
sinon.stub(admin, 'firestore').get(() => () => fakeFirestore);
sinon.stub(admin, 'storage').get(() => () => fakeStorage);

const testResults = {
  'contains-text.jpg': [{ fullTextAnnotation: { text: 'Hello World' } }],
  'bad-image.jpg': [{ error: { code: 3 } }],
  'no-text.jpg': [{}],
};
const ImageAnnotatorClient = sinon.stub();
ImageAnnotatorClient.prototype.documentTextDetection = sinon
  .stub()
  .callsFake(async (file) => testResults[file.match(/\/([^\/]+)$/)[1]]);
sinon.stub(vision, 'ImageAnnotatorClient').get(() => ImageAnnotatorClient);

const detectText$ = test.wrap(require('../src').detectText);
(admin.initializeApp as any).restore();
const detectText = (file: string) =>
  detectText$({
    name: `images/testUserId/${file}`,
    bucket,
  });

describe('Detect text Cloud Function (offline)', () => {
  after(() => {
    if ((admin.firestore as any).restore) {
      (admin.firestore as any).restore();
    }
    if ((admin.storage as any).restore) {
      (admin.storage as any).restore();
    }
    if ((vision.ImageAnnotatorClient as any).restore) {
      (vision.ImageAnnotatorClient as any).restore();
    }
  });

  it('should write the text if text was detected', async () => {
    const res = await detectText('contains-text.jpg');
    expect(res).to.deep.equal({ text: 'Hello World' });
  });

  it('should detect bad images', async () => {
    const res = await detectText('bad-image.jpg');
    expect(res).to.deep.equal({ state: 'bad-image' });
  });

  it('should detect no text', async () => {
    const res = await detectText('no-text.jpg');
    expect(res).to.deep.equal({ state: 'no-text' });
  });
});
