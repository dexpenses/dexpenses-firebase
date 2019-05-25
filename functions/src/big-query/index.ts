import * as functions from 'firebase-functions';
import { BigQuery } from '@google-cloud/bigquery';

export const aggregateTotal = functions.https.onCall(async (data, context) => {
  const query = `SELECT round(sum(amount), 2) as total
  FROM \`dexpenses-207219.dexpenses_bi.actual_receipts\`
  WHERE user_id = @user_id
  AND timestamp >= @start
  AND timestamp <= @end`;
  const [[result]] = await new BigQuery().query({
    query,
    params: {
      user_id: 'test',
      start: data.start,
      end: data.end || new Date(),
    },
  });
  return { value: result.total };
});

const PERIODS_TO_FIELD = {
  hourly: 'hour',
  daily: 'day',
  monthly: 'month',
  yearly: 'year',
};
const VALID_PERIODS = Object.keys(PERIODS_TO_FIELD);

export const aggregateTotalOverTimePeriod = functions.https.onCall(
  async (data, context) => {
    const { period, start, end } = data;
    if (!period || !VALID_PERIODS.includes(period)) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        `invalid period: must be one of ${VALID_PERIODS}`
      );
    }
    const params = {
      user_id: 'test',
      start,
      end,
    };
    const aggregations = VALID_PERIODS.slice(VALID_PERIODS.indexOf(period))
      .reverse()
      .map((a) => PERIODS_TO_FIELD[a]);
    const extractorAs = (a: string) => `extract(${a} from timestamp) as ${a}`;
    const asc = (a: string) => `${a} asc`;
    const query = `SELECT ${aggregations
      .map(extractorAs)
      .join(', ')}, round(sum(amount), 2) as total
    FROM \`dexpenses-207219.dexpenses_bi.actual_receipts\`
    where user_id = @user_id
    and timestamp >= @start
    and timestamp <= @end
    group by ${aggregations.join(', ')}
    order by ${aggregations.map(asc).join(', ')}`;
    const [result] = await new BigQuery().query({
      query,
      params,
    });
    return result;
  }
);

function parseParams(
  data: { start?: string; end?: string },
  context: functions.https.CallableContext
) {
  return {
    user_id: 'test',
    start: data.start || new Date(0),
    end: data.end || new Date(),
  };
}

export const aggregateByTags = functions.https.onCall(async (data, context) => {
  const params = parseParams(data, context);
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
});

export const aggregateByPaymentMethod = functions.https.onCall(
  async (data, context) => {
    const params = parseParams(data, context);
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
