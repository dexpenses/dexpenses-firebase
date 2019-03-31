import { expect } from 'chai';
import 'mocha';
import PlacePostProcessor, { fromComponents } from './PlacePostProcessor';
import { AddressComponent } from '@google/maps';

describe('PlacePostProcessor', () => {
  it('should extract the address from Geocoded address components', () => {
    const addressComponents: AddressComponent[] = [
      {
        long_name: '9',
        short_name: '9',
        types: ['street_number'],
      },
      {
        long_name: 'Brandgehaege',
        short_name: 'Brandgehaege',
        types: ['route'],
      },
      {
        long_name: 'Hattorf-Heiligendorf',
        short_name: 'Hattorf-Heiligendorf',
        types: ['political', 'sublocality'],
      },
      {
        long_name: 'Wolfsburg',
        short_name: 'WOB',
        types: ['locality', 'political'],
      },
      {
        long_name: 'Niedersachsen',
        short_name: 'NDS',
        types: ['administrative_area_level_1', 'political'],
      },
      {
        long_name: 'Germany',
        short_name: 'DE',
        types: ['country', 'political'],
      },
      {
        long_name: '38444',
        short_name: '38444',
        types: ['postal_code'],
      },
    ];
    expect(fromComponents(addressComponents)).to.deep.equal({
      street: 'Brandgehaege 9',
      city: '38444 Wolfsburg',
    });
  });

  it('should take the phone number if none was extracted before', () => {
    const receipt = {
      place: {
        formatted_phone_number: '123456789',
      } as any,
      phone: undefined,
    };

    const ppp = new PlacePostProcessor();
    ppp.touch(receipt, {});
    expect(receipt.phone).to.equal('123456789');
  });

  it('should not overwrite the extracted phone number', () => {
    const receipt = {
      place: {
        formatted_phone_number: '123456789',
      } as any,
      phone: '987654321',
    };

    const ppp = new PlacePostProcessor();
    ppp.touch(receipt, {});
    expect(receipt.phone).to.equal('987654321');
  });

  it('should set the place name as single header line', () => {
    const receipt = {
      place: {
        name: 'place name',
      } as any,
      header: ['old', 'header'],
    };

    const ppp = new PlacePostProcessor();
    ppp.touch(receipt, {});
    expect(receipt.header).to.deep.equal(['place name']);
  });
});
