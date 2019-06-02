import * as fbTest from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import * as https from './https';

const test = fbTest();

jest.spyOn(admin, 'initializeApp');

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
