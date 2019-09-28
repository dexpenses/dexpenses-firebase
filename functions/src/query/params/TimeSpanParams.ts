import BaseParams from './BaseParams';
import { DateTime } from 'luxon';
import { fail } from '../../validation';

export default interface TimeSpanParams extends BaseParams {
  start?: string | Date;
  end?: string | Date;
}
type OptionalDate = string | Date | undefined | null;
function validateDate(date: OptionalDate, name: string) {
  if (
    !(
      date === null ||
      date === undefined ||
      (typeof date === 'string' && DateTime.fromISO(date).isValid) ||
      (date instanceof Date && !isNaN(date.getTime()))
    )
  ) {
    fail(`property ${name} is an invalid date`);
  }
}

export default class TimeSpanParams {
  static validate(data: TimeSpanParams) {
    validateDate(data.start, 'start');
    validateDate(data.end, 'end');
  }
}
