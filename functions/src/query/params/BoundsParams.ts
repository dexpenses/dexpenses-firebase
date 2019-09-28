import { validateRequired } from '../../validation';

export interface LatLng {
  lat: number;
  lng: number;
}

export default interface BoundsParams {
  southWest: LatLng;
  northEast: LatLng;
}

function validateLngLat(v: any, lngLatKey: string) {
  validateRequired(v[lngLatKey], lngLatKey);
  validateRequired(v[lngLatKey].lng, 'lng');
  validateRequired(v[lngLatKey].lat, 'lat');
}

export default class BoundsParams {
  static validate(data: Partial<BoundsParams>) {
    validateLngLat(data, 'southWest');
    validateLngLat(data, 'northEast');
  }
}
