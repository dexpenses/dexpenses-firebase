import { Receipt as BaseReceipt } from '@dexpenses/core';
import TimeSpanParams, {
  InternalTimeSpanParams,
} from '../params/TimeSpanParams';
import BoundsParams from '../params/BoundsParams';
import TimePeriodParams from '../params/TimePeriodParams';
import { validateRequired } from '../../validation';

export interface Receipt extends BaseReceipt {
  tags?: string[];
}

export interface Kpi<T> {
  value: T;
}

export type GroupByResult<K, V> = Array<{ key: K; value: V }>;

/**
 * Query contract that defines queries and params as they come in
 */
export interface QueryContract {
  /**
   * Aggregates the total expenses over a given time frame
   * @param params user scope and possible time frame
   */
  aggregateTotal(params: TimeSpanParams): Promise<Kpi<number>>;
  /**
   * Aggregates the monthly total over a given time frame
   *
   * Note that the time frame should contain full months!
   * @param params user scope and possible time frame
   */
  aggregateAverageTotal(params: TimeSpanParams): Promise<Kpi<number>>;
  /**
   * Finds receipts that were issued within a given time frame and given rectangular geographical bounds
   * @param params user scope, optional time frame and rectangle bounds to search
   */
  findByBoundingBox(params: TimeSpanParams & BoundsParams): Promise<Receipt[]>;
  /**
   * Groups expenses by receipt tags within the given time frame
   * @param params user scope and optional time frame
   */
  groupByTags(params: TimeSpanParams): Promise<GroupByResult<string, number>>;
  /**
   * Groups expenses by payment method within the given time frame
   * @param params user scope and optional time frame
   */
  groupByPaymentMethod(
    params: TimeSpanParams
  ): Promise<GroupByResult<string, number>>;
  /**
   * Aggregates the total expenses by the given unit within the given time frame
   *
   * @param params user scope, optional time frame and aggregation unit
   * @returns array of starting date of a time period along with the corresponding aggregated total
   */
  aggregateTotalOverTimePeriod(
    params: Required<TimeSpanParams> & TimePeriodParams
  ): Promise<GroupByResult<Date, number>>;
}

/**
 * Internal query contract to implement that takes validated and parsed parameters
 */
export interface InternalQueryContract extends QueryContract {
  aggregateTotal(params: InternalTimeSpanParams): Promise<Kpi<number>>;
  aggregateAverageTotal(params: InternalTimeSpanParams): Promise<Kpi<number>>;
  findByBoundingBox(
    params: InternalTimeSpanParams & BoundsParams
  ): Promise<Receipt[]>;
  groupByTags(
    params: InternalTimeSpanParams
  ): Promise<GroupByResult<string, number>>;
  groupByPaymentMethod(
    params: InternalTimeSpanParams
  ): Promise<GroupByResult<string, number>>;

  aggregateTotalOverTimePeriod(
    params: InternalTimeSpanParams & TimePeriodParams
  ): Promise<GroupByResult<Date, number>>;
}

/**
 * Base query contract implementation that validates and parsed parameters
 * and then delegates to a given internal query contract
 */
export class QueryHandler implements QueryContract {
  constructor(private qc: InternalQueryContract) {}

  get queryNames() {
    return Object.keys(this.qc);
  }

  aggregateTotal(params: TimeSpanParams): Promise<Kpi<number>> {
    TimeSpanParams.validate(params);
    return this.qc.aggregateTotal(TimeSpanParams.parse(params));
  }
  aggregateAverageTotal(params: TimeSpanParams): Promise<Kpi<number>> {
    TimeSpanParams.validate(params);
    return this.qc.aggregateAverageTotal({
      ...params,
      ...TimeSpanParams.parse(params),
    });
  }
  findByBoundingBox(params: TimeSpanParams & BoundsParams): Promise<Receipt[]> {
    TimeSpanParams.validate(params);
    BoundsParams.validate(params);
    return this.qc.findByBoundingBox({
      ...params,
      ...TimeSpanParams.parse(params),
    });
  }
  groupByTags(params: TimeSpanParams): Promise<GroupByResult<string, number>> {
    TimeSpanParams.validate(params);
    return this.qc.groupByTags(TimeSpanParams.parse(params));
  }

  groupByPaymentMethod(
    params: TimeSpanParams
  ): Promise<GroupByResult<string, number>> {
    TimeSpanParams.validate(params);
    return this.qc.groupByPaymentMethod(TimeSpanParams.parse(params));
  }
  aggregateTotalOverTimePeriod(
    params: Required<TimeSpanParams> & TimePeriodParams
  ): Promise<GroupByResult<Date, number>> {
    validateRequired(params.start, 'start');
    validateRequired(params.end, 'end');
    TimeSpanParams.validate(params);
    TimePeriodParams.validate(params);
    return this.qc.aggregateTotalOverTimePeriod({
      ...params,
      ...TimeSpanParams.parse(params),
    });
  }
}
