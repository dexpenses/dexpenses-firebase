import { Extractor } from './extractor';
import { Receipt, Amount } from '../../model/receipt';
import { DependsOn } from '../DependsOn';
import { PaymentMethodExtractor } from './paymentMethod';
import { getAllMatches } from '../../utils/regex-utils';

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

/*
 1. line start or space
 2. optionally negative number (, and . match as decimal point with optional space after decimal point)
 with no leading zero where S also matches as 5
 3. line end, space or dash
 */
const amountValuePattern = /(?:^|\s)-?((?:[1-9]\d+|\d)[,.]\s?[\dS]{2})(?:[\-\s]|$)/gim;

// TODO: we could include date filter (i.e. not take dd.MM from the matched date as amount value)
export function getAmountValues(lines: string[]): number[] {
  return lines
    .filter((line) => !line.includes('AS-Zeit') && !line.endsWith('Uhr'))
    .flatMap<any>((line) => getAllMatches(amountValuePattern, line))
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
