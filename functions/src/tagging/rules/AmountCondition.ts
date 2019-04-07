import Condition from './Condition';
import { Receipt } from '../../extract/receipt';
import { Operator, parseOperator } from './Operator';

export default class AmountCondition implements Condition {
  private cmp: (x: number, y: number) => boolean;

  constructor(op: Operator, private value: number) {
    this.cmp = parseOperator(op);
  }

  test(receipt: Receipt): boolean {
    return !!receipt.amount && this.cmp(receipt.amount.value, this.value);
  }
}
