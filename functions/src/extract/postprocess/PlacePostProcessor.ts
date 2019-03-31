import { Receipt } from '../receipt';
import PostProcessor from './PostProcessor';
import {
  AddressComponent,
  AddressType,
  GeocodingAddressComponentType,
} from '@google/maps';
import { Address } from '../address';

export default class PlacePostProcessor extends PostProcessor {
  public touch(extracted: Receipt, metadata: { [key: string]: any }) {
    const place = extracted.place;
    if (!place) {
      return;
    }
    if (place.name) {
      extracted.header = [place.name];
      metadata.relevantHeaderLines = undefined; // disable header sanitizer
    }
    if (place.address_components) {
      extracted.address = fromComponents(place.address_components);
    }
    if (!extracted.phone && place.formatted_phone_number) {
      extracted.phone = place.formatted_phone_number;
    }
  }
}

function extract(
  componentName: AddressType | GeocodingAddressComponentType,
  addressComponents: AddressComponent[]
): string | undefined {
  return addressComponents
    .filter((ac) => ac.types.indexOf(componentName) !== -1)
    .map((ac) => ac.long_name)
    .shift();
}

export function fromComponents(addressComponents: AddressComponent[]): Address {
  const city = extract('locality', addressComponents);
  const postalCode = extract('postal_code', addressComponents);
  const street = extract('route', addressComponents);
  const streetNumber = extract('street_number', addressComponents);
  return {
    street: `${street} ${streetNumber}`,
    city: `${postalCode} ${city}`,
  };
}
