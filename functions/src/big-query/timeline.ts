import * as functions from 'firebase-functions';
import bigQueryCallable, { Validate } from './big-query-callable';

const PERIODS_TO_FIELD = {
  hourly: 'hour',
  daily: 'day',
  monthly: 'month',
  yearly: 'year',
};
const VALID_PERIODS = Object.keys(PERIODS_TO_FIELD);

export const aggregateTotalOverTimePeriod = bigQueryCallable({
  validate(data) {
    Validate.required(data, 'start');
    Validate.required(data, 'end');
    if (!data.period || !VALID_PERIODS.includes(data.period)) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        `invalid period: must be one of ${VALID_PERIODS}`
      );
    }
  },
  query(data) {
    const aggregations = VALID_PERIODS.slice(VALID_PERIODS.indexOf(data.period))
      .reverse()
      .map((a) => PERIODS_TO_FIELD[a]);
    const extractorAs = (a: string) => `extract(${a} from timestamp) as ${a}`;
    const asc = (a: string) => `${a} asc`;
    return `SELECT ${aggregations
      .map(extractorAs)
      .join(', ')}, round(sum(amount), 2) as total
    FROM \`dexpenses-207219.dexpenses_bi.actual_receipts\`
    where user_id = @user_id
    and timestamp >= @start
    and timestamp <= @end
    group by ${aggregations.join(', ')}
    order by ${aggregations.map(asc).join(', ')}`;
  },
  parseParams(data) {
    const { start, end } = data;
    return {
      user_id: 'test',
      start,
      end,
    };
  },
});
