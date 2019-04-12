import ruleEngine from './engine';
import AndCondition from '@dexpenses/rule-conditions/lib/AndCondition';
import HeaderCondition from '@dexpenses/rule-conditions/lib/HeaderCondition';
import AmountCondition from '@dexpenses/rule-conditions/lib/AmountCondition';
import CurrencyCondition from '@dexpenses/rule-conditions/lib/CurrencyCondition';
import OrCondition from '@dexpenses/rule-conditions/lib/OrCondition';
import DateCondition from '@dexpenses/rule-conditions/lib/DateCondition';
import NotCondition from '@dexpenses/rule-conditions/lib/NotCondition';
import PaymentMethodCondition from '@dexpenses/rule-conditions/lib/PaymentMethodCondition';
import TimeCondition from '@dexpenses/rule-conditions/lib/TimeCondition';
import { Receipt } from '../../extract/receipt';
import { DateTime } from 'luxon';

describe('RuleEngine', () => {
  it('should resolve correct tags', () => {
    const condition = new AndCondition([
      new HeaderCondition('markt'),
      new AmountCondition('<', 10),
      new CurrencyCondition('EUR'),
      new OrCondition([
        new DateCondition('weekday', '==', 6),
        new DateCondition('weekday', '==', 7),
      ]),
      new NotCondition(new PaymentMethodCondition('DEBIT')),
      new TimeCondition({ hour: 16, minute: 0 }, 'after'),
    ]);
    const rule = {
      condition,
      tags: ['tag'],
    };
    const receipt: Receipt = {
      header: ['markt'],
      amount: {
        value: 9,
        currency: 'EUR',
      },
      date: DateTime.fromISO('2019-04-06T00:00:00.000+02:00').toJSDate(), // Saturday
      paymentMethod: 'CREDIT',
      time: {
        hour: 16,
        minute: 0,
        second: 1,
      },
    };
    expect(ruleEngine(receipt, [rule])).toEqual(['tag']);
    expect(
      ruleEngine(
        {
          ...receipt,
          date: DateTime.fromISO('2019-04-07T00:00:00.000+02:00').toJSDate(), // Sunday
        },
        [rule]
      )
    ).toEqual(['tag']);
    expect(ruleEngine({ ...receipt, header: ['store'] }, [rule])).toEqual([]);
    expect(
      ruleEngine({ ...receipt, amount: { value: 10, currency: 'EUR' } }, [rule])
    ).toEqual([]);
    expect(
      ruleEngine({ ...receipt, amount: { value: 9, currency: 'USD' } }, [rule])
    ).toEqual([]);
    expect(
      ruleEngine(
        {
          ...receipt,
          date: DateTime.fromISO('2019-04-05T00:00:00.000+02:00').toJSDate(), // Friday
        },
        [rule]
      )
    ).toEqual([]);
    expect(ruleEngine({ ...receipt, paymentMethod: 'DEBIT' }, [rule])).toEqual(
      []
    );
    expect(
      ruleEngine({ ...receipt, time: { hour: 15, minute: 59 } }, [rule])
    ).toEqual([]);
  });
});
