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

export function geographyToLatLng(geo?: Geography): LatLngLiteral | undefined {
  if (!geo) {
    return undefined;
  }
  const [, lngString, latString] = geo.value.match(
    /^POINT\(([\d.]+) ([\d.]+)\)$/
  )!;
  const [lng, lat] = [lngString, latString].map((s) => parseFloat(s));
  if (isNaN(lng) || isNaN(lat)) {
    return undefined;
  }
  return {
    lng,
    lat,
  };
}
