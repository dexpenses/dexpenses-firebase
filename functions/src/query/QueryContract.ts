import { Receipt as BaseReceipt } from '@dexpenses/core';
import * as https from '../https';

export interface BaseParams {
  userId: string;
}

export interface TimeSpanParams extends BaseParams {
  start?: string | Date;
  end?: string | Date;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Bounds {
  southWest: LatLng;
  northEast: LatLng;
}

export interface Receipt extends BaseReceipt {
  tags?: string[];
}

export type TimePeriod = 'hour' | 'day' | 'month' | 'year';

export interface Kpi<T> {
  value: T;
}

export type GroupByResult<K, V> = Array<{ key: K; value: V }>;

export interface QueryContract {
  aggregateTotal(params: TimeSpanParams): Promise<Kpi<number>>;
  aggregateAverageTotal(params: TimeSpanParams & Bounds): Promise<Kpi<number>>;
  findByBoundingBox(params: TimeSpanParams & Bounds): Promise<Receipt[]>;
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
    params: Required<TimeSpanParams> & { period: TimePeriod }
  ): Promise<GroupByResult<Date, number>>;
}

export function createFunctions(prefix: string, queries: QueryContract) {
  return Object.entries(queries)
    .map(([name, fn]) => [(prefix || '') + name, https.onAuthenticatedCall(fn)])
    .reduce((acc, [name, fn]) => {
      acc[name as string] = fn;
      return acc;
    }, {});
}
