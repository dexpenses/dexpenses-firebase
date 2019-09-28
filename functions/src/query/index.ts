import * as https from '../https';
import { validateSet, validateNotBlank } from '../validation';
import mongoQueries from './mongo-queries';

export const query = https.onAuthenticatedCall(async (data, context) => {
  validateNotBlank(data.name, 'name');
  validateSet(data.name, mongoQueries.queryNames, 'name');

  return mongoQueries[data.name]({
    ...(data.params || {}),
    userId: context.auth.uid,
  });
});
