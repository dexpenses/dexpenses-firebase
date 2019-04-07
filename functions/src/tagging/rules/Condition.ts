import { Receipt } from '../../extract/receipt';

export default interface Condition {
  test(receipt: Receipt): boolean;
}
