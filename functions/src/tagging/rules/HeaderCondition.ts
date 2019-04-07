import { Condition } from './Condition';
import { Receipt } from '../../extract/receipt';

export class HeaderCondition implements Condition {
  constructor(private searchString: string, private caseSensitive = false) {}

  test(receipt: Receipt): boolean {
    if (!receipt.header) {
      return false;
    }
    if (this.caseSensitive) {
      return receipt.header.join(' ').includes(this.searchString);
    }
    return receipt.header
      .map((l) => l.toLocaleLowerCase())
      .join('')
      .includes(this.searchString.toLocaleLowerCase());
  }
}
