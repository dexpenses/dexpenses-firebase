import { Receipt as BaseReceipt } from '@dexpenses/core';
import TimeSpanParams from './params/TimeSpanParams';
import BoundsParams from './params/BoundsParams';
import TimePeriodParams from './params/TimePeriodParams';

export interface Receipt extends BaseReceipt {
  tags?: string[];
}

export interface Kpi<T> {
  value: T;
}

export type GroupByResult<K, V> = Array<{ key: K; value: V }>;

export interface QueryContract {
  aggregateTotal(params: TimeSpanParams): Promise<Kpi<number>>;
  aggregateAverageTotal(
    params: TimeSpanParams & BoundsParams
  ): Promise<Kpi<number>>;
  findByBoundingBox(params: TimeSpanParams & BoundsParams): Promise<Receipt[]>;
  groupByTags(params: TimeSpanParams): Promise<GroupByResult<string, number>>;
  groupByPaymentMethod(
    params: TimeSpanParams
  ): Promise<GroupByResult<string, number>>;
  /**
   * Aggregates the total expenses
   * @param params params
   * @returns array of starting date of a time period along with the corresponding aggregated total
   */
  aggregateTotalOverTimePeriod(
    params: Required<TimeSpanParams> & TimePeriodParams
  ): Promise<GroupByResult<Date, number>>;
}
