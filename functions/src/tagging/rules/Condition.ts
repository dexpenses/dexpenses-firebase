import { Receipt } from '../../extract/receipt';

export interface Condition {
  test(receipt: Receipt): boolean;
}
