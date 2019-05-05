import { Extractor } from './extractor';
import { Receipt } from '../../model/receipt';
import { anyLineMatches } from './util';

export enum PaymentMethod {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
  CASH = 'CASH',
}

const paymentMethodIdentifiers = {
  [PaymentMethod.DEBIT]: [
    /[g9]irocar\s*d/i,
    /zahlart[:\s]\s*EC/i,
    /Euro\s?ELV/i,
    /EC Kartenzahlung/i,
    /gegeben EC/i,
    /EC Karte/i,
    /gegeben kreditsch\./i,
    /Lastschrift/i,
  ],
  [PaymentMethod.CREDIT]: [/visa/i],
  [PaymentMethod.CASH]: [/(^|\s)bar(\s|$)/i, /(^|\s)bargeld(\s|$)/i],
};

function tryMatchMethod(line: string): string | null {
  // tslint:disable-next-line: forin
  for (const method in paymentMethodIdentifiers) {
    const identifiers = paymentMethodIdentifiers[method];
    for (const identifier of identifiers) {
      if (line.match(identifier)) {
        return method;
      }
    }
  }
  return null;
}

export class PaymentMethodExtractor extends Extractor<string> {
  constructor() {
    super('paymentMethod');
  }

  public extract(
    text: string,
    lines: string[],
    extracted: Receipt
  ): string | null {
    return anyLineMatches(lines, (line) => {
      return tryMatchMethod(line);
    }).asIs();
  }
}
