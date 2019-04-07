import Condition from './Condition';
import { Receipt, Time } from '../../extract/receipt';

function seconds(time: Time): number {
  return time.hour * 60 * 60 + time.minute * 60 + (time.second || 0);
}

export default class TimeCondition implements Condition {
  private threshold: number;
  private cmp: (seconds: number) => boolean;
  constructor(threshold: Time, type: 'before' | 'after') {
    this.threshold = seconds(threshold);
    switch (type) {
      case 'before':
        this.cmp = (s) => s < this.threshold;
        break;
      case 'after':
        this.cmp = (s) => s >= this.threshold;
        break;
      default:
        throw new Error('unknown compare type: ' + type);
    }
  }

  test(receipt: Receipt): boolean {
    return !!receipt.time && this.cmp(seconds(receipt.time));
  }
}
