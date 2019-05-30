import * as https from '../https';
import { BigQuery } from '@google-cloud/bigquery';

export const findByBoundingBox = https.onAuthenticatedCall(
  async (data, context) => {
    const params = {
      user_id: context.auth.uid,
      sw_lng: data.southWest.lng,
      sw_lat: data.southWest.lat,
      ne_lng: data.northEast.lng,
      ne_lat: data.northEast.lat,
    };
    const query = `select * from \`dexpenses-207219.dexpenses_bi.actual_receipts\`
  WHERE (user_id = @user_id OR user_id = 'test')
  AND ST_INTERSECTSBOX(location, @sw_lng, @sw_lat, @ne_lng, @ne_lat)`;
    const [result] = await new BigQuery().query({ query, params });
    return result;
  }
);
