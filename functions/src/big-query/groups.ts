import { parseTimePeriodParams } from './util';
import bigQueryCallable from './big-query-callable';

export const aggregateByTags = bigQueryCallable({
  parseParams: parseTimePeriodParams,
  query: `SELECT tag, round(sum(r.amount), 2) as total
  FROM \`dexpenses-207219.dexpenses_bi.actual_receipts\` as r
  cross join UNNEST(r.tags) as tag
  where user_id = @user_id
  and r.timestamp >= @start
  and r.timestamp <= @end
  group by tag
  order by total desc
  `,
});

export const aggregateByPaymentMethod = bigQueryCallable({
  parseParams: parseTimePeriodParams,
  query: `select payment_method, round(sum(amount),2) as total
  from \`dexpenses-207219.dexpenses_bi.actual_receipts\` as r
  where user_id = @user_id
  and r.timestamp >= @start
  and r.timestamp <= @end
  group by payment_method
  order by total desc`,
});
