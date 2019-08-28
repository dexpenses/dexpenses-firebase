import { Receipt as BaseReceipt } from '@dexpenses/core';

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
  northEach: LatLng;
}

export interface Receipt extends BaseReceipt {
  tags?: string[];
}
// interface Contract {
//   [query: string]: <T extends BaseParams>(p: T) => any;
// }

export type TimePeriod = 'hour' | 'day' | 'month' | 'year';

export interface QueryContract {
  aggregateTotal(params: TimeSpanParams): Promise<number>;
  aggregateAverageTotal(params: TimeSpanParams & Bounds): Promise<number>;
  findByBoundingBox(params: TimeSpanParams & Bounds): Promise<Receipt[]>;
  groupByTags(params: TimeSpanParams): Promise<Array<[string, number]>>;
  groupByPaymentMethod(
    params: TimeSpanParams
  ): Promise<Array<[string, number]>>;
  /**
   * Aggregates the total expenses
   * @param params params
   * @returns array of starting date of a time period along with the corresponding aggregated total
   */
  aggregateTotalOverTimePeriod(
    params: Required<TimeSpanParams> & { period: TimePeriod }
  ): Promise<Array<[Date, number]>>;
}

export function createFunctions(prefix: string, queries: QueryContract) {
  return Object.entries(queries)
    .map(([name, fn]) => [(prefix || '') + name, fn])
    .reduce((acc, [name, fn]) => {
      acc[name] = fn;
      return acc;
    }, {});
}
