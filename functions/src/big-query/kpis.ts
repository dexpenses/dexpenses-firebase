import * as functions from 'firebase-functions';
import { BigQuery } from '@google-cloud/bigquery';
import {
  parseTimePeriodParams,
  bigQueryCallable,
  ResultTransformers,
} from './util';

export const aggregateTotal = functions.https.onCall(async (data, context) => {
  const query = `SELECT round(sum(amount), 2) as total
  FROM \`dexpenses-207219.dexpenses_bi.actual_receipts\`
  WHERE user_id = @user_id
  AND timestamp >= @start
  AND timestamp <= @end`;
  const [[result]] = await new BigQuery().query({
    query,
    params: parseTimePeriodParams(data, context),
  });
  return { value: result.total };
});

export const aggregateTotal2 = bigQueryCallable({
  query: `SELECT round(sum(amount), 2) as total
  FROM \`dexpenses-207219.dexpenses_bi.actual_receipts\`
  WHERE user_id = @user_id
  AND timestamp >= @start
  AND timestamp <= @end`,
  parseParams: parseTimePeriodParams,
  resultTransformer: ResultTransformers.SINGLE_VALUE,
});

export const aggregateAverageTotal = functions.https.onCall(
  async (data, context) => {
    const query = `
  select round(avg(total), 2) as avg_monthly_total from (
      SELECT
      extract(year from timestamp) as year,
      extract(month from timestamp) as month,
      sum(amount) as total
      FROM \`dexpenses-207219.dexpenses_bi.actual_receipts\`
      where user_id = @user_id
      and timestamp >= @start
      and timestamp <= @end
      group by year, month
  )`;
    const [[result]] = await new BigQuery().query({
      query,
      params: parseTimePeriodParams(data, context),
    });
    return { value: result.avg_monthly_total };
  }
);
