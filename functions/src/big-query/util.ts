import * as functions from 'firebase-functions';

export function parseTimePeriodParams(
  data: { start?: string; end?: string },
  context: functions.https.CallableContext
) {
  return {
    user_id: 'test',
    start: data.start || new Date(0),
    end: data.end || new Date(),
  };
}
