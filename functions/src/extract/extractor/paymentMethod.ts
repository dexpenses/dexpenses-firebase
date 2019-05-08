import { Extractor } from './extractor';
import { Receipt } from '../../model/receipt';
import { anyLineMatches } from './util';

export enum PaymentMethod {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
  CASH = 'CASH',
  DKV_CARD = 'DKV_CARD',
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
    /(^|\s)EC(\s|$)/i,
    /(^|\s)SEPA(\s|$)/i,
  ],
  [PaymentMethod.CREDIT]: [/visa/i],
  [PaymentMethod.CASH]: [/(^|\s)bar(geld|zahlung)?(\s|$)/i],
  [PaymentMethod.DKV_CARD]: [/DK[VI] Selection Card/i, /(^|\s)DKV(\s|$)/i],
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
