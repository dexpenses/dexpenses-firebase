import { parseCondition } from './parse';
import AmountCondition from './AmountCondition';
import CurrencyCondition from './CurrencyCondition';
import HeaderCondition from './HeaderCondition';
import AndCondition from './AndCondition';
import PaymentMethodCondition from './PaymentMethodCondition';
import OrCondition from './OrCondition';
import NotCondition from './NotCondition';
import DateCondition from './DateCondition';
import TimeCondition from './TimeCondition';

jest.mock('./AmountCondition');
jest.mock('./CurrencyCondition');
jest.mock('./DateCondition');
jest.mock('./HeaderCondition');
jest.mock('./PaymentMethodCondition');
jest.mock('./TimeCondition');

beforeEach(() => {
  (AmountCondition as any).mockClear();
  (CurrencyCondition as any).mockClear();
  (DateCondition as any).mockClear();
  (HeaderCondition as any).mockClear();
  (PaymentMethodCondition as any).mockClear();
  (TimeCondition as any).mockClear();
});

describe('Field condition parser', () => {
  it('should parse AmountCondition', () => {
    const condition = parseCondition({
      amount: ['>', 10],
    });
    expect(condition).toBeInstanceOf(AmountCondition);
    expect(AmountCondition).toHaveBeenCalledTimes(1);
    expect(AmountCondition).toHaveBeenCalledWith('>', 10);
  });

  it('should parse CurrencyCondition', () => {
    const condition = parseCondition({
      currency: 'EUR',
    });
    expect(condition).toBeInstanceOf(CurrencyCondition);
    expect(CurrencyCondition).toHaveBeenCalledTimes(1);
    expect(CurrencyCondition).toHaveBeenCalledWith('EUR');
  });

  it('should parse DateCondition', () => {
    const condition = parseCondition({
      date: ['weekday', '==', 7],
    });
    expect(condition).toBeInstanceOf(DateCondition);
    expect(DateCondition).toHaveBeenCalledTimes(1);
    expect(DateCondition).toHaveBeenCalledWith('weekday', '==', 7);
  });

  it('should parse HeaderCondition', () => {
    const condition = parseCondition({
      header: ['header', true],
    });
    expect(condition).toBeInstanceOf(HeaderCondition);
    expect(HeaderCondition).toHaveBeenCalledTimes(1);
    expect(HeaderCondition).toHaveBeenCalledWith('header', true);
  });

  it('should parse PaymentMethodCondition', () => {
    const condition = parseCondition({
      paymentMethod: 'DEBIT',
    });
    expect(condition).toBeInstanceOf(PaymentMethodCondition);
    expect(PaymentMethodCondition).toHaveBeenCalledTimes(1);
    expect(PaymentMethodCondition).toHaveBeenCalledWith('DEBIT');
  });

  it('should parse TimeCondition', () => {
    const condition = parseCondition({
      time: ['after', '16:00'],
    });
    expect(condition).toBeInstanceOf(TimeCondition);
    expect(TimeCondition).toHaveBeenCalledTimes(1);
    expect(TimeCondition).toHaveBeenCalledWith(
      { hour: 16, minute: 0 },
      'after'
    );
  });
});

describe('Boolean condition parser', () => {
  it('should parse AndCondition', () => {
    const condition = parseCondition({
      $and: [
        {
          header: ['header', false],
        },
        {
          paymentMethod: 'DEBIT',
        },
      ],
    });
    expect(condition).toBeInstanceOf(AndCondition);
    expect(condition.conditions).toHaveLength(2);
    expect(condition.conditions[0]).toBeInstanceOf(HeaderCondition);
    expect(condition.conditions[1]).toBeInstanceOf(PaymentMethodCondition);
  });

  it('should parse OrCondition', () => {
    const condition = parseCondition({
      $or: [
        {
          header: ['header', false],
        },
        {
          paymentMethod: 'DEBIT',
        },
      ],
    });
    expect(condition).toBeInstanceOf(OrCondition);
    expect(condition.conditions).toHaveLength(2);
    expect(condition.conditions[0]).toBeInstanceOf(HeaderCondition);
    expect(condition.conditions[1]).toBeInstanceOf(PaymentMethodCondition);
  });

  it('should parse NotCondition', () => {
    const condition = parseCondition({
      $not: {
        header: ['header', false],
      },
    });
    expect(condition).toBeInstanceOf(NotCondition);
    expect(condition.condition).toBeInstanceOf(HeaderCondition);
  });
});
