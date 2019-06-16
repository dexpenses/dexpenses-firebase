import { onAuthenticatedCall } from '../https';
import * as functions from 'firebase-functions';
import * as algoliasearch from 'algoliasearch';

export const getSearchApiKey = onAuthenticatedCall(async (data, context) => {
  const config = functions.config().algolia;
  const client = algoliasearch(config.appid, config.apikey);
  return client.generateSecuredApiKey(config.searchonlyapikey, {
    filters: `owner:${context.auth.uid}`,
    userToken: context.auth.uid,
  });
});
