import { Geography, BigQuery } from '@google-cloud/bigquery';
import { LatLngLiteral } from '@google/maps';

export function latLngToGeography(
  latLng?: LatLngLiteral
): Geography | undefined {
  if (!latLng) {
    return undefined;
  }
  const { lng, lat } = latLng;
  if (!lng || !lat) {
    return undefined;
  }
  return BigQuery.geography(`POINT(${lng} ${lat})`);
}
