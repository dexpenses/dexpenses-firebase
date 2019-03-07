import { Extractor } from "./extractor";
import { Receipt } from "./receipt";

export enum PaymentMethod {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
  CASH = 'CASH',
}

const paymentMethodIdentifiers = {
  [PaymentMethod.DEBIT]: [
    /girocard/i
  ],
  [PaymentMethod.CREDIT]: [
    /visa/i
  ],
  [PaymentMethod.CASH]: [
    /bar/i
  ]
}

function tryMatchMethod(line: string): string | null {
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

export class PaymentMethodExtractor extends Extractor {

  constructor() {
    super('paymentMethod');
  }

  extract(text: string, lines: string[], extracted: Receipt): string | null {
    return Extractor.anyLineMatches(lines, line => {
      return tryMatchMethod(line);
    }).asIs();
  }

}
