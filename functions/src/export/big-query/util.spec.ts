import { latLngToGeography } from './util';
import { Geography } from '@google-cloud/bigquery';

describe('BigQueryExport utils: latLngToGeometry', () => {
  it('should be undefined for undefined input', () => {
    expect(latLngToGeography()).toBeUndefined();
  });

  it('should be undefined if lat or lng is undefined', () => {
    expect(latLngToGeography({} as any)).toBeUndefined();
    expect(latLngToGeography({ lat: 1.0 } as any)).toBeUndefined();
    expect(latLngToGeography({ lng: 1.0 } as any)).toBeUndefined();
  });

  it('should successfully create geometry point', () => {
    const geo = latLngToGeography({ lat: 1.1, lng: 2.3 });
    expect(geo).toBeDefined();
    expect(geo).toBeInstanceOf(Geography);
    expect(geo!.value).toBe('POINT(2.3 1.1)');
  });
});
