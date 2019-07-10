import * as fbTest from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import * as https from './https';
import { anyOf } from './https';
import { firestore, firestoreDb } from '../test/firebase-stubs';

const test = fbTest();

jest.spyOn(admin, 'initializeApp');
jest.spyOn(admin, 'firestore' as any, 'get').mockReturnValue(() => firestore);

describe('https authenticated callable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should error on unauthenticated', async () => {
    const handler = jest.fn();
    const func = test.wrap(https.onAuthenticatedCall(handler));
    await expect(func({}, { auth: null })).rejects.toThrowError(
      /authenticated/
    );
    expect(handler).not.toHaveBeenCalled();
  });

  it('should call handler on authenticated', async () => {
    const handler = jest.fn().mockReturnValue('result');
    const func = test.wrap(https.onAuthenticatedCall(handler));
    await expect(func({}, { auth: { uid: 'test' } })).resolves.toBe('result');
    expect(handler).toHaveBeenCalled();
  });
});

describe('https authorized callable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    firestore.clear();
  });

  it('should error on unauthenticated', async () => {
    const handler = jest.fn();
    const func = test.wrap(https.onAuthorizedCall(anyOf('admin'))(handler));
    await expect(func({}, { auth: null })).rejects.toThrowError(
      /authenticated/
    );
    expect(handler).not.toHaveBeenCalled();
  });

  it('should error on unauthorized: no user data', async () => {
    const handler = jest.fn();
    const func = test.wrap(https.onAuthorizedCall(anyOf('admin'))(handler));
    await expect(func({}, { auth: { uid: 'test' } })).rejects.toThrowError(
      /permission-denied/
    );
    expect(handler).not.toHaveBeenCalled();
  });

  it('should error on unauthorized: no roles', async () => {
    const handler = jest.fn();
    firestoreDb['auth/test'] = {};
    const func = test.wrap(https.onAuthorizedCall(anyOf('admin'))(handler));
    await expect(func({}, { auth: { uid: 'test' } })).rejects.toThrowError(
      /permission-denied/
    );
    expect(handler).not.toHaveBeenCalled();
  });

  it('should error on unauthorized: missing roles', async () => {
    const handler = jest.fn();
    firestoreDb['auth/test'] = { roles: ['other_role'] };
    const func = test.wrap(https.onAuthorizedCall(anyOf('admin'))(handler));
    await expect(func({}, { auth: { uid: 'test' } })).rejects.toThrowError(
      /permission-denied/
    );
    expect(handler).not.toHaveBeenCalled();
  });

  it('should call handler on authorized', async () => {
    const handler = jest.fn().mockReturnValue('result');
    firestoreDb['auth/test'] = { roles: ['admin'] };
    const func = test.wrap(https.onAuthorizedCall(anyOf('admin'))(handler));
    await expect(func({}, { auth: { uid: 'test' } })).resolves.toBe('result');
    expect(handler).toHaveBeenCalled();
  });
});
