import { DependsOn } from './DependsOn';
import { Extractor } from './extractor';
import { HeaderExtractor } from './header';
import { Receipt } from './receipt';
import { createClient as createGmapsClient } from '@google/maps';
import * as functions from 'firebase-functions';
import HeaderSanitizer from './postprocess/HeaderSanitizer';
import { PhoneNumberExtractor } from './phone';

@DependsOn(HeaderExtractor, PhoneNumberExtractor)
export class PlaceExtractor extends Extractor {
  constructor() {
    super('place');
  }

  public async extract(text: string, lines: string[], extracted: Receipt) {
    if (!extracted.header || extracted.header.length === 0) {
      return null;
    }
    const client = createGmapsClient({
      key: functions.config().gmaps.key,
      Promise,
    });
    const sanitized = {
      header: [...extracted.header],
    };
    new HeaderSanitizer().touch(sanitized, this.metadata);
    const address = sanitized.header.join(',');
    console.log('Sending GeoCode request with address: ' + address);
    const res = await client.geocode({ address }).asPromise();
    const result = res.json.results[0];
    console.log('Got GeoCode result: ' + JSON.stringify(result));
    if (!result.place_id) {
      return result;
    }
    const pdr = await client
      .place({
        placeid: result.place_id,
        fields: ['name', 'formatted_phone_number', 'website'],
      })
      .asPromise();
    console.log('Got PlaceDetails result: ' + JSON.stringify(pdr));
    return { ...result, ...pdr.json.result };
  }
}
