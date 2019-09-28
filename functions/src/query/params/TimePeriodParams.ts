import { validateRequired, validateSet } from '../../validation';

export type TimePeriod = 'hour' | 'day' | 'month' | 'year';

export default interface TimePeriodParams {
  period: TimePeriod;
}

export default class TimePeriodParams {
  static validate(data: Partial<TimePeriodParams>) {
    validateRequired(data.period, 'period');
    validateSet(data.period, ['hour', 'day', 'month', 'year'], 'period');
  }
}
