import { DependsOn } from '../DependsOn';
import { Extractor } from './extractor';
import { HeaderExtractor } from './header';
import { Receipt } from '../../model/receipt';
import {
  createClient as createGmapsClient,
  GeocodingResult,
  PlaceDetailsResult,
} from '@google/maps';
import * as functions from 'firebase-functions';
import { PhoneNumberExtractor } from './phone';
import { DateExtractor } from './date';
import { TimeExtractor } from './time';
import HeaderCleanUpPostProcessor from '../postprocess/HeaderCleanUpPostProcessor';

export type Place = GeocodingResult & PlaceDetailsResult;

@DependsOn(HeaderExtractor, PhoneNumberExtractor, DateExtractor, TimeExtractor)
export class PlaceExtractor extends Extractor<Place> {
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
    const cleanedHolder = { header: [...extracted.header] };
    new HeaderCleanUpPostProcessor().touch(cleanedHolder);
    const address = cleanedHolder.header.join(',');
    const res = await client.geocode({ address }).asPromise();
    const result = res.json.results[0];
    if (!result.place_id) {
      return result as Place;
    }
    const pdr = await client
      .place({
        placeid: result.place_id,
        fields: ['name', 'formatted_phone_number', 'website'],
      })
      .asPromise();
    return { ...result, ...pdr.json.result } as Place;
  }
}
