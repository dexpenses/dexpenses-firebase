import bigQueryCallable, { Validate } from './big-query-callable';

function validateLngLat(v: any, lngLatKey: string) {
  Validate.required(v, lngLatKey);
  Validate.required(v[lngLatKey], 'lng');
  Validate.required(v[lngLatKey], 'lat');
}

export const findByBoundingBox = bigQueryCallable({
  validate(data) {
    validateLngLat(data, 'southWest');
    validateLngLat(data, 'northEast');
  },
  parseParams(data, context) {
    return {
      user_id: context.auth.uid,
      sw_lng: data.southWest.lng,
      sw_lat: data.southWest.lat,
      ne_lng: data.northEast.lng,
      ne_lat: data.northEast.lat,
    };
  },
  query: `select * from \`dexpenses-207219.dexpenses_bi.actual_receipts\`
  WHERE (user_id = @user_id OR user_id = 'test')
  AND ST_INTERSECTSBOX(location, @sw_lng, @sw_lat, @ne_lng, @ne_lat)`,
});
