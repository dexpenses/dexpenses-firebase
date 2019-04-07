import Condition from './Condition';
import { Receipt } from '../../extract/receipt';

export default class CurrencyCondition implements Condition {
  constructor(private currency: string) {}

  test(receipt: Receipt): boolean {
    return !!receipt.amount && receipt.amount.currency === this.currency;
  }
}
