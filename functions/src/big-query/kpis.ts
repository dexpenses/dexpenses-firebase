import { parseTimePeriodParams } from './util';
import bigQueryCallable, { ResultTransformers } from './big-query-callable';

export const aggregateTotal = bigQueryCallable({
  query: `SELECT round(sum(amount), 2) as total
  FROM \`dexpenses-207219.dexpenses_bi.actual_receipts\`
  WHERE user_id = @user_id
  AND timestamp >= @start
  AND timestamp <= @end`,
  parseParams: parseTimePeriodParams,
  resultTransformer: ResultTransformers.SINGLE_VALUE,
});

export const aggregateAverageTotal = bigQueryCallable({
  query: `select round(avg(total), 2) as avg_monthly_total from (
      SELECT
      extract(year from timestamp) as year,
      extract(month from timestamp) as month,
      sum(amount) as total
      FROM \`dexpenses-207219.dexpenses_bi.actual_receipts\`
      where user_id = @user_id
      and timestamp >= @start
      and timestamp <= @end
      group by year, month
  )`,
  parseParams: parseTimePeriodParams,
  resultTransformer: ResultTransformers.SINGLE_VALUE,
});
