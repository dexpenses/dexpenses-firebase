import { Extractor } from './extractor';
import { Receipt } from '../receipt';
import { DependsOn } from '../DependsOn';
import { PaymentMethodExtractor } from './paymentMethod';

export interface Amount {
  value: number;
  currency: 'EUR' | 'USD' | 'GBP';
}

@DependsOn(PaymentMethodExtractor)
export class AmountExtractor extends Extractor<Amount> {
  constructor() {
    super('amount');
  }

  public extract(
    text: string,
    lines: string[],
    extracted: Receipt
  ): Amount | null {
    let m = text.match(/(?:gesamt|summe)(?:\s+EUR)?\s*(\d+,\d\d).*$/i);
    if (m) {
      return {
        value: parseFloat(m[1].replace(',', '.')),
        currency: 'EUR',
      } as Amount;
    }

    m = text.match(/betrag(?:\s+EUR)?\s*(\d+,\d\d).*$/i);
    if (m) {
      return {
        value: parseFloat(m[1].replace(',', '.')),
        currency: 'EUR',
      } as Amount;
    }
    if (extracted.paymentMethod === 'CASH') {
      const amountValue = findAmountFromCashPaymentValues(
        getAmountValues(lines)
      );
      if (amountValue) {
        return {
          value: amountValue,
          currency: 'EUR',
        };
      }
    }
    const maxAmount = getAmountValues(lines).reduce(
      (max: number | null, cur) => {
        return !max || cur > max ? cur : max;
      },
      null
    );
    if (maxAmount) {
      return {
        value: maxAmount,
        currency: 'EUR',
      };
    }
    return null;
  }
}

function getAllMatches(regex: RegExp, s: string) {
  let m: RegExpExecArray | null;
  const matches: RegExpExecArray[] = [];
  while ((m = regex.exec(s)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    matches.push(m);
  }
  return matches;
}

export function getAmountValues(lines: string[]): number[] {
  return lines
    .filter((line) => !line.includes('AS-Zeit') && !line.endsWith('Uhr'))
    .flatMap<any>((line) =>
      getAllMatches(/(?:^|\s)-?(\d+[,.]\s?[\dS]{2})(?:[\-\s]|$)/gim, line)
    )
    .map(([_, amount]) =>
      parseFloat(
        amount
          .replace(/\s/g, '')
          .replace(/S/g, '5')
          .replace(',', '.')
      )
    );
}

function equal(x: number, y: number) {
  return Number(Math.abs(x - y).toFixed(2)) < Number.EPSILON;
}

export function findAmountFromCashPaymentValues(values: number[]) {
  for (let i = values.length - 3; i >= 0; i -= 1) {
    const [amount, given, back] = values.slice(i, i + 3);
    if (equal(amount + back, given)) {
      return amount;
    }
  }
  return null;
}
