import OrCondition from './OrCondition';
import Condition from './Condition';
import { Receipt } from '../../extract/receipt';

class MockCondition implements Condition {
  constructor(public test: (r: Receipt) => boolean) {}
}

describe('OrCondition', () => {
  it('should evaluate each condition', () => {
    const firstTest = jest.fn().mockReturnValue(false);
    const secondTest = jest.fn().mockReturnValue(true);
    const condition = new OrCondition([
      new MockCondition(firstTest),
      new MockCondition(secondTest),
    ]);
    expect(condition.test({})).toBeTruthy();
    expect(firstTest).toHaveBeenCalled();
    expect(secondTest).toHaveBeenCalled();
  });

  it('should abort on first true', () => {
    const firstTest = jest.fn().mockReturnValue(true);
    const secondTest = jest.fn().mockReturnValue(false);
    const condition = new OrCondition([
      new MockCondition(firstTest),
      new MockCondition(secondTest),
    ]);
    expect(condition.test({})).toBeTruthy();
    expect(firstTest).toHaveBeenCalled();
    expect(secondTest).not.toHaveBeenCalled();
  });
});
