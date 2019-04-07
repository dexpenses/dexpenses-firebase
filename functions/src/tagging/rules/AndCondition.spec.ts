import AndCondition from './AndCondition';
import Condition from './Condition';
import { Receipt } from '../../extract/receipt';

class MockCondition implements Condition {
  constructor(public test: (r: Receipt) => boolean) {}
}

describe('AndCondition', () => {
  it('should abort on first false', () => {
    const firstTest = jest.fn().mockReturnValue(false);
    const secondTest = jest.fn().mockReturnValue(true);
    const condition = new AndCondition([
      new MockCondition(firstTest),
      new MockCondition(secondTest),
    ]);
    expect(condition.test({})).toBeFalsy();
    expect(firstTest).toHaveBeenCalled();
    expect(secondTest).not.toHaveBeenCalled();
  });

  it('should evaluate each condition', () => {
    const firstTest = jest.fn().mockReturnValue(true);
    const secondTest = jest.fn().mockReturnValue(true);
    const condition = new AndCondition([
      new MockCondition(firstTest),
      new MockCondition(secondTest),
    ]);
    expect(condition.test({})).toBeTruthy();
    expect(firstTest).toHaveBeenCalled();
    expect(secondTest).toHaveBeenCalled();
  });
});
