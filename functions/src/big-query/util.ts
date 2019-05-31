import * as https from '../https';

export function parseTimePeriodParams(
  data: { start?: string; end?: string },
  context: https.AuthenticatedCallableContext
) {
  return {
    user_id: 'test',
    start: data.start || new Date(0),
    end: data.end || new Date(),
  };
}
