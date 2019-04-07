import Condition from './Condition';
import { Receipt } from '../../extract/receipt';

export default class PaymentMethodCondition implements Condition {
  constructor(private paymentMethod: string) {}

  test(receipt: Receipt): boolean {
    return (
      !!receipt.paymentMethod && receipt.paymentMethod === this.paymentMethod
    );
  }
}
