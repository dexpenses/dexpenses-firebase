import { DependsOn } from './DependsOn';
import { Extractor } from './extractor';
import { HeaderExtractor } from './header';
import { Receipt } from './receipt';
import * as gmaps from '@google/maps';
import * as functions from 'firebase-functions';
import { Address, AddressExtractor } from './address';

@DependsOn(HeaderExtractor, AddressExtractor)
export class PlaceExtractor extends Extractor {
  constructor() {
    super('place');
  }

  public async extract(text: string, lines: string[], extracted: Receipt) {
    if (!extracted.header || extracted.header.length === 0) {
      return null;
    }
    const client = gmaps.createClient({
      key: functions.config().gmaps.key,
      Promise,
    });
    const address = buildAddressQuery(extracted.header, extracted.address);
    const res = await client.geocode({ address }).asPromise();
    const result = res.json.results[0];
    if (!result.place_id) {
      return result;
    }
    const pdr = await client
      .place({
        placeid: result.place_id,
        fields: ['name', 'formatted_phone_number', 'website'],
      })
      .asPromise();
    return { ...result, ...pdr.json.result };
  }
}

function buildAddressQuery(header: string[], address?: Address): string {
  if (address && address.street && address.city) {
    return `${header.join(',')}, ${address.street}, ${address.city}`;
  }
  return header.join(',');
}
