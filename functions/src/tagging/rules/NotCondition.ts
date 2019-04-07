import Condition from './Condition';
import { Receipt } from '../../extract/receipt';

export default class NotCondition implements Condition {
  constructor(private condition: Condition) {}

  test(receipt: Receipt): boolean {
    return !this.condition.test(receipt);
  }
}
