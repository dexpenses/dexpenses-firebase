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
const mockCreateIssue = jest.fn();
jest.mock('@octokit/rest', () =>
  jest.fn().mockImplementation(() => ({
    repos: {
      createOrUpdateFile: mockCreateOrUpdateFile,
    },
    issues: {
      create: mockCreateIssue,
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
  const fullInfo: { content: string; path: string } & TestDataInfo = {
    content: 'content',
    category: 'ec',
    cityCode: 'wob',
    name: 'name',
    classifier: 'classifier',
    paymentMethod: 'CREDIT',
    path: 'ec/wob-name-credit.jpg',
  };

  it('should throw error if content is missing or blank', async () => {
    await expect(
      addTestDataFile(
        { ...fullInfo, content: undefined },
        {
          auth: {
            uid: 'test',
          },
        }
      )
    ).rejects.toThrowError(/content/);
    await expect(
      addTestDataFile(
        { ...fullInfo, content: '' },
        {
          auth: {
            uid: 'test',
          },
        }
      )
    ).rejects.toThrowError(/content/);

    await expect(
      addTestDataFile(
        { ...fullInfo, content: '  ' },
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
        { ...fullInfo, category: '  ' },
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
        { ...fullInfo, cityCode: '  ' },
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
        { ...fullInfo, name: '  ' },
        {
          auth: {
            uid: 'test',
          },
        }
      )
    ).rejects.toThrowError(/name/);
  });

  it('should throw error if payment method is invalid', async () => {
    await expect(
      addTestDataFile(
        { ...fullInfo, paymentMethod: 'invalid' },
        {
          auth: {
            uid: 'test',
          },
        }
      )
    ).rejects.toThrowError(/payment method/);
  });

  it('should throw error if path is missing', async () => {
    await expect(
      addTestDataFile(
        { ...fullInfo, path: '  ' },
        {
          auth: {
            uid: 'test',
          },
        }
      )
    ).rejects.toThrowError(/path/);
  });

  it('should execute correctly if paymentMethod is missing', async () => {
    await expect(
      addTestDataFile(
        { ...fullInfo, paymentMethod: undefined },
        { auth: { uid: 'test' } }
      )
    ).resolves.toEqual({ success: true });

    expect(mockCreateOrUpdateFile.mock.calls[0]).toMatchSnapshot();
    expect(mockCreateIssue.mock.calls[0]).toMatchSnapshot();
  });

  it('should execute correctly if classifier is missing', async () => {
    await expect(
      addTestDataFile(
        { ...fullInfo, classifier: undefined },
        { auth: { uid: 'test' } }
      )
    ).resolves.toEqual({ success: true });

    expect(mockCreateOrUpdateFile.mock.calls[0]).toMatchSnapshot();
    expect(mockCreateIssue.mock.calls[0]).toMatchSnapshot();
  });

  it('should execute correctly if all info is provided', async () => {
    await expect(
      addTestDataFile(fullInfo, { auth: { uid: 'test' } })
    ).resolves.toEqual({ success: true });

    expect(mockCreateOrUpdateFile.mock.calls[0]).toMatchSnapshot();
    expect(mockCreateIssue.mock.calls[0]).toMatchSnapshot();
  });
});
