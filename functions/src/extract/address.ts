import { Extractor } from './extractor';
import { Receipt } from './receipt';
import { DependsOn } from './DependsOn';
import { HeaderExtractor } from './header';
import * as fs from 'fs';
import * as path from 'path';

export interface Address {
  city?: string;
  street?: string;
}

type CityName = string;
type ZipCodeMapping = { [zipCode: string]: CityName };

function loadZipCodeMapping(filePath: string): ZipCodeMapping {
  return fs
    .readFileSync(filePath, 'utf8')
    .split('\n')
    .filter(line => !!line)
    .map(line => line.split(';'))
    .reduce((mapping, [city, zip]) => {
      mapping[zip.trim()] = city.trim();
      return mapping;
    }, {});
}

@DependsOn(HeaderExtractor)
export class AddressExtractor extends Extractor {
  private readonly zipCodeMapping?: ZipCodeMapping;
  private readonly cityRegex: RegExp;

  constructor(
    zipCodeMappingPath?: string,
    zipCodeRegex = /(?!01000|99999)(0[1-9]\d{3}|[1-9]\d{4})/,
    cityNameRegex = /([a-z\u00e0-\u00ff]+)/
  ) {
    super('address');
    if (zipCodeMappingPath) {
      this.zipCodeMapping = loadZipCodeMapping(path.resolve(__dirname, zipCodeMappingPath));
    }
    this.cityRegex = new RegExp(`${zipCodeRegex.source}\\s+${cityNameRegex.source}`, 'i');
  }

  extract(text: string, lines: string[], extracted: Receipt) {
    if (!extracted.header || extracted.header.length === 0) {
      return null;
    }
    const address: Address = {};
    const newHeaders: string[] = [];
    for (const line of extracted.header) {
      if (!address.city) {
        const city = line.match(this.cityRegex);
        if (city && (!this.zipCodeMapping || this.zipCodeMapping[city[1]] === city[2])) {
          address.city = city[0];
          continue;
        }
      }
      if (!address.street) {
        const street = line.match(/([a-z\u00e0-\u00ff]+\s+)*[a-z\u00e0-\u00ff]+\s+\d{1,4}[a-z]?/i);
        if (street) {
          address.street = street[0];
          continue;
        }
      }
      newHeaders.push(line);
    }
    extracted.header = newHeaders;
    return address;
  }
}
