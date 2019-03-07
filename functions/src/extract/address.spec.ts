import { expect } from 'chai';
import 'mocha';
import { AddressExtractor } from './address';

describe('Address extractor', () => {
  const extractor = new AddressExtractor('model/German-Zip-Codes.csv');

  it('should be successfully extract the street', () => {
    const streets = [
      'Beispielstrasse 1',
      'Beispielstrasse  1',
      'Beispielstrasse 1a',
      'Beispielstrasse 12',
      'Beispielstrasse 123',
      'Beispielstrasse 1234',
      'Beispielstrasse 1234a',
      'An dem Wege 1',
    ];
    for (const street of streets) {
      const extracted = {
        header: ['Toller Laden', street, '38440 Wolfsburg'],
      };
      const result = extractor.extract('', [], extracted);
      expect(result).to.exist;
      if (result) {
        expect(result.street).to.equal(street);
      }
      expect(extracted.header).to.deep.equal(['Toller Laden']);
    }
  });

  it('should be successfully extract the city', () => {
    const cities = ['38440 Wolfsburg', '38440  Wolfsburg', '30159  Hannover', '37081 Göttingen'];
    for (const city of cities) {
      const extracted = {
        header: ['Toller Laden', 'An dem Wege 1', city],
      };
      const result = extractor.extract('', [], extracted);
      expect(result).to.exist;
      if (result) {
        expect(result.city).to.equal(city);
      }
      expect(extracted.header).to.deep.equal(['Toller Laden']);
    }
  });
});
