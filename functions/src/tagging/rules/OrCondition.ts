import Condition from './Condition';
import { Receipt } from '../../extract/receipt';

export default class OrCondition implements Condition {
  constructor(private conditions: Condition[]) {}

  test(receipt: Receipt): boolean {
    return this.conditions.some((c) => c.test(receipt));
  }
}
