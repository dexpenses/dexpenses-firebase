import * as https from '../https';
import { validateRequired, validateSet } from '../validation';
import mongoQueries from './mongo-queries';

export const query = https.onAuthenticatedCall(async (data, context) => {
  validateRequired(data.name, 'name');
  validateSet(data.name, Object.keys(mongoQueries), 'name');

  return mongoQueries[data.name]({
    ...(data.params || {}),
    userId: context.auth.uid,
  });
});
