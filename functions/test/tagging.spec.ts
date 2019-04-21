import * as firebaseFunctionsTest from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { firestore, updateFn } from './firebase-stubs';
import { TaggingMessage } from '../src/tagging';
import TaggingEngine from '../src/tagging/TaggingEngine';
import HeaderCondition from '@dexpenses/rule-conditions/lib/HeaderCondition';

const test = firebaseFunctionsTest();

jest.spyOn(admin, 'initializeApp');
jest.spyOn(admin, 'firestore' as any, 'get').mockReturnValue(() => firestore);
jest.spyOn(TaggingEngine, 'loadForUser').mockResolvedValue(
  new TaggingEngine([
    {
      condition: new HeaderCondition('header', false),
      tags: ['tag'],
    },
  ])
);

const tagging = test.wrap(require('../src').tagging);

beforeEach(() => {
  updateFn.mockClear();
});

describe('Tagging cloud function (offline)', () => {
  it('should load rules, calculate tags and save tags', async () => {
    const msg: TaggingMessage = {
      userId: 'testUserId',
      receiptId: 'test-receipt.jpg',
      result: {
        data: {
          header: ['header'],
        },
      },
    };
    await tagging({
      json: msg,
    });
    expect(updateFn).toMatchSnapshot();
  });
});
