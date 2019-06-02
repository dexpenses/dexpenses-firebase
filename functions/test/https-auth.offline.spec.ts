import * as fbTest from 'firebase-functions-test';
import { CloudFunction } from 'firebase-functions';

const test = fbTest();

/**
 * Tests that all HTTPS function require authentication
 */
describe.each(
  Object.entries<CloudFunction<any>>(require('../src')).filter(
    ([name, func]) => func.__trigger.httpsTrigger
  )
)('HTTPS Function %s', (name, actualFunc: any) => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should error on unauthenticated call', async () => {
    const func = test.wrap(actualFunc);
    await expect(func({}, { auth: null })).rejects.toThrowError(
      /authenticated/
    );
  });
});
