import AndCondition from './AndCondition';
import OrCondition from './OrCondition';
import NotCondition from './NotCondition';
import HeaderCondition from './HeaderCondition';
import AmountCondition from './AmountCondition';
import CurrencyCondition from './CurrencyCondition';
import DateCondition from './DateCondition';
import TimeCondition from './TimeCondition';
import { Time } from '../../extract/receipt';
import PaymentMethodCondition from './PaymentMethodCondition';

function parseTime(timeString: string): Time {
  const [hour, minute, second] = timeString.split(':');
  return {
    hour: parseInt(hour, 10),
    minute: parseInt(minute, 10),
    second: !second ? undefined : parseInt(second, 10),
  };
}

export function parseCondition(json: any) {
  const [key, value]: [string, any] = Object.entries(json)[0];
  switch (key) {
    case '$and':
      return new AndCondition(value.map(parseCondition));
    case '$or':
      return new OrCondition(value.map(parseCondition));
    case '$not':
      return new NotCondition(parseCondition(value));
    case 'header':
      const [searchString, caseSensitive] = value;
      return new HeaderCondition(searchString, caseSensitive);
    case 'amount':
      const [aop, n] = value;
      return new AmountCondition(aop, n);
    case 'currency':
      return new CurrencyCondition(value);
    case 'paymentMethod':
      return new PaymentMethodCondition(value);
    case 'date':
      const [dateField, dop, dn] = value;
      return new DateCondition(dateField, dop, dn);
    case 'time':
      const [type, tn] = value;
      return new TimeCondition(parseTime(tn), type);
    default:
      throw new Error('unknown key: ' + key);
  }
}
