import * as fbTest from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { firestore, firestoreDb } from './firebase-stubs';
import { runTextDetection } from '../src/detect-text';

const test = fbTest();

jest.spyOn(admin, 'initializeApp');

jest.spyOn(admin, 'firestore' as any, 'get').mockReturnValue(() => firestore);

jest.mock('../src/detect-text');

let manualTextDetection;
beforeEach(() => {
  jest.clearAllMocks();
  firestoreDb['auth/test'] = { roles: 'contributor' };
  manualTextDetection = test.wrap(require('../src').manualTextDetection);
});

describe('admin functions/manualTextDetection', () => {
  it('should require "contributor" role', async () => {
    firestoreDb['auth/test'] = {};
    await expect(
      manualTextDetection(
        {},
        {
          auth: {
            uid: 'test',
          },
        }
      )
    ).rejects.toThrowError(/permission-denied/);
  });
  it('should throw error if url is missing', async () => {
    await expect(
      manualTextDetection(
        {},
        {
          auth: {
            uid: 'test',
          },
        }
      )
    ).rejects.toThrowError(/url/);
  });

  it('should execute the function', async () => {
    (runTextDetection as jest.Mock<any>).mockReturnValue({ result: 'text' });
    await expect(
      manualTextDetection(
        { url: 'gs://bucket/image' },
        { auth: { uid: 'test' } }
      )
    ).resolves.toEqual({ result: 'text' });

    expect(runTextDetection).toHaveBeenCalled();
  });
});
