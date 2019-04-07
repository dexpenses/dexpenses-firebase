import Condition from './Condition';
import { Receipt } from '../../extract/receipt';

export default class AndCondition implements Condition {
  constructor(private conditions: Condition[]) {}

  test(receipt: Receipt): boolean {
    return this.conditions.every((c) => c.test(receipt));
  }
}
