import * as fbTest from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import {
  firestore,
  firestoreDb,
  storage,
  storageOperation,
} from './firebase-stubs';
import { TestDataInfo } from '../src/admin';
import { File } from '@google-cloud/storage';

const test = fbTest();

jest.spyOn(admin, 'initializeApp');

jest.spyOn(admin, 'firestore' as any, 'get').mockReturnValue(() => firestore);
jest.spyOn(admin, 'storage' as any, 'get').mockReturnValue(() => storage);

let moveTestDataImage;
beforeEach(() => {
  jest.clearAllMocks();
  firestoreDb['auth/test'] = { roles: 'contributor' };
  moveTestDataImage = test.wrap(require('../src').moveTestDataImage);
});

const validData: { source: string } & TestDataInfo = {
  source: 'test-some.jpg',
  category: 'ec',
  cityCode: 'wob',
  name: 'name',
  paymentMethod: 'CREDIT',
};

describe('admin functions/moveTestDataImage', () => {
  it('should require "contributor" role', async () => {
    firestoreDb['auth/test'] = {};
    await expect(
      moveTestDataImage(
        {},
        {
          auth: {
            uid: 'test',
          },
        }
      )
    ).rejects.toThrowError(/permission-denied/);
  });
  it('should throw error if source is missing or blank', async () => {
    await expect(
      moveTestDataImage(
        { ...validData, source: null },
        {
          auth: {
            uid: 'test',
          },
        }
      )
    ).rejects.toThrowError(/source/);
    await expect(
      moveTestDataImage(
        { ...validData, source: undefined },
        {
          auth: {
            uid: 'test',
          },
        }
      )
    ).rejects.toThrowError(/source/);
    await expect(
      moveTestDataImage(
        { ...validData, source: '' },
        {
          auth: {
            uid: 'test',
          },
        }
      )
    ).rejects.toThrowError(/source/);
    await expect(
      moveTestDataImage(
        { ...validData, source: ' ' },
        {
          auth: {
            uid: 'test',
          },
        }
      )
    ).rejects.toThrowError(/source/);
  });

  it('should throw error if test data info is invalid', async () => {
    await expect(
      moveTestDataImage(
        { ...validData, category: '  ' },
        {
          auth: {
            uid: 'test',
          },
        }
      )
    ).rejects.toThrowError(/category/);
  });

  it('should execute the function', async () => {
    await expect(
      moveTestDataImage(validData, { auth: { uid: 'test' } })
    ).resolves.toEqual({ success: true });

    const [
      { bucket, type, file, destination },
    ] = storageOperation.mock.calls[0];
    expect(type).toBe('move');
    expect(bucket).toBe('dexpenses-207219-test-image-upload');
    expect(file).toBe(validData.source);
    expect((destination as File).bucket).toBe('dexpenses-207219-test-images');
    expect((destination as File).name).toBe('ec/wob-name-credit.jpg');
  });
});
