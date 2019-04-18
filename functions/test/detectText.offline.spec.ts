import * as fbTest from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import * as vision from '@google-cloud/vision';
import * as pubsub from '@google-cloud/pubsub';
import { firestore, storage } from './firebase-stubs';

const bucket = 'test-bucket';

const test = fbTest();

const initializeAppStub = jest.spyOn(admin, 'initializeApp');
jest.spyOn(admin, 'initializeApp');
const firestoreStub = jest
  .spyOn(admin, 'firestore' as any, 'get')
  .mockReturnValue(() => firestore);
const storageStub = jest
  .spyOn(admin, 'storage' as any, 'get')
  .mockReturnValue(() => storage);

const testResults = {
  'contains-text.jpg': [{ fullTextAnnotation: { text: 'Hello World' } }],
  'bad-image.jpg': [{ error: { code: 3 } }],
  'no-text.jpg': [{}],
};

jest.mock('@google-cloud/vision');
vision.ImageAnnotatorClient.prototype.textDetection = jest
  .fn()
  .mockImplementation(
    async (file) => testResults[file.match(/\/([^\/]+)$/)[1]]
  );

jest.mock('@google-cloud/pubsub');
pubsub.PubSub.prototype.topic = jest.fn().mockReturnValue({
  publish: jest
    .fn()
    .mockImplementation((buffer) => JSON.parse(buffer.toString())),
});

const detectText$ = test.wrap(require('../src').detectText);
initializeAppStub.mockRestore();
const detectText = (file: string) =>
  detectText$({
    name: `images/testUserId/${file}`,
    bucket,
  });

describe('Detect text Cloud Function (offline)', () => {
  afterAll(() => {
    firestoreStub.mockRestore();
    storageStub.mockRestore();
    vision.ImageAnnotatorClient.prototype.textDetection.mockRestore();
    (pubsub.PubSub.prototype.topic as any).mockRestore();
  });

  it('should write the text if text was detected', async () => {
    const res = await detectText('contains-text.jpg');
    expect(res).toEqual({
      fileName: 'contains-text.jpg',
      text: 'Hello World',
      userId: 'testUserId',
    });
  });

  it('should detect bad images', async () => {
    const res = await detectText('bad-image.jpg');
    expect(res).toEqual({ state: 'error', error: { code: 3 } });
  });

  it('should detect no text', async () => {
    const res = await detectText('no-text.jpg');
    expect(res).toEqual({ state: 'no-text' });
  });
});
