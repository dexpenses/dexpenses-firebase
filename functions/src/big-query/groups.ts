import * as https from '../https';
import { BigQuery } from '@google-cloud/bigquery';
import { parseTimePeriodParams } from './util';

export const aggregateByTags = https.onAuthenticatedCall(
  async (data, context) => {
    const params = parseTimePeriodParams(data, context);
    const query = `
  SELECT tag, round(sum(r.amount), 2) as total
  FROM \`dexpenses-207219.dexpenses_bi.actual_receipts\` as r
  cross join UNNEST(r.tags) as tag
  where user_id = @user_id
  and r.timestamp >= @start
  and r.timestamp <= @end
  group by tag
  order by total desc
  `;
    const [result] = await new BigQuery().query({ query, params });
    return result;
  }
);

export const aggregateByPaymentMethod = https.onAuthenticatedCall(
  async (data, context) => {
    const params = parseTimePeriodParams(data, context);
    const query = `
    select payment_method, round(sum(amount),2) as total
    from \`dexpenses-207219.dexpenses_bi.actual_receipts\` as r
    where user_id = @user_id
    and r.timestamp >= @start
    and r.timestamp <= @end
    group by payment_method
    order by total desc`;
    const [result] = await new BigQuery().query({ query, params });
    return result;
  }
);
