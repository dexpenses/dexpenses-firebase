import * as fbTest from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { firestore, firestoreDb } from './firebase-stubs';
import { TestDataInfo } from '../src/admin';

const test = fbTest();

jest.spyOn(admin, 'initializeApp');
jest.spyOn(functions, 'config').mockReturnValue({
  github: {
    bot: {
      key: 'key',
    },
  },
});

const mockCreateOrUpdateFile = jest.fn();
jest.mock('@octokit/rest', () =>
  jest.fn().mockImplementation(() => ({
    repos: {
      createOrUpdateFile: mockCreateOrUpdateFile,
    },
  }))
);

jest.spyOn(admin, 'firestore' as any, 'get').mockReturnValue(() => firestore);

let addTestDataFile;
beforeEach(() => {
  jest.clearAllMocks();
  firestoreDb['auth/test'] = { roles: 'contributor' };
  addTestDataFile = test.wrap(require('../src').addTestDataFile);
});

describe('admin functions/addTestDataFile', () => {
  it('should require "contributor" role', async () => {
    firestoreDb['auth/test'] = {};
    await expect(
      addTestDataFile(
        {},
        {
          auth: {
            uid: 'test',
          },
        }
      )
    ).rejects.toThrowError(/permission-denied/);
  });
  const validData: { content: string } & TestDataInfo = {
    content: 'content',
    category: 'ec',
    cityCode: 'wob',
    name: 'name',
    paymentMethod: 'credit',
  };

  it('should throw error if content is missing or blank', async () => {
    await expect(
      addTestDataFile(
        { ...validData, content: undefined },
        {
          auth: {
            uid: 'test',
          },
        }
      )
    ).rejects.toThrowError(/content/);
    await expect(
      addTestDataFile(
        { ...validData, content: '' },
        {
          auth: {
            uid: 'test',
          },
        }
      )
    ).rejects.toThrowError(/content/);

    await expect(
      addTestDataFile(
        { ...validData, content: '  ' },
        {
          auth: {
            uid: 'test',
          },
        }
      )
    ).rejects.toThrowError(/content/);
  });

  it('should throw error if category is missing', async () => {
    await expect(
      addTestDataFile(
        { ...validData, category: '  ' },
        {
          auth: {
            uid: 'test',
          },
        }
      )
    ).rejects.toThrowError(/category/);
  });

  it('should throw error if cityCode is missing', async () => {
    await expect(
      addTestDataFile(
        { ...validData, cityCode: '  ' },
        {
          auth: {
            uid: 'test',
          },
        }
      )
    ).rejects.toThrowError(/cityCode/);
  });

  it('should throw error if name is missing', async () => {
    await expect(
      addTestDataFile(
        { ...validData, name: '  ' },
        {
          auth: {
            uid: 'test',
          },
        }
      )
    ).rejects.toThrowError(/name/);
  });

  it('should throw error if paymentMethod is missing', async () => {
    await expect(
      addTestDataFile(
        { ...validData, paymentMethod: '  ' },
        {
          auth: {
            uid: 'test',
          },
        }
      )
    ).rejects.toThrowError(/paymentMethod/);
  });

  it('should send correct request to GitHub', async () => {
    await expect(
      addTestDataFile(validData, { auth: { uid: 'test' } })
    ).resolves.toEqual({ success: true });

    expect(mockCreateOrUpdateFile.mock.calls[0]).toMatchSnapshot();
  });
});
