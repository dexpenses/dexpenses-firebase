import { PlaceExtractor } from './place';
import * as gmaps from '@google/maps';
import * as functions from 'firebase-functions';

jest.mock('@google/maps');
jest.mock('firebase-functions');
const geocode = jest.fn().mockReturnValue({
  asPromise: jest.fn().mockResolvedValue({
    json: {
      results: [
        {
          //place_id: '0815'
        },
      ],
    },
  }),
});
(gmaps.createClient as any).mockReturnValue({
  geocode,
});
(functions.config as any).mockReturnValue({
  gmaps: {
    key: '',
  },
});

describe('PlaceExtractor', () => {
  const extractor = new PlaceExtractor();

  it('should build the correct address query', () => {
    extractor.extract('', [], {
      header: ['Line 1', 'Line 2', 'Line 3'],
    });
    expect(geocode).toHaveBeenCalledTimes(1);
    expect(geocode).toHaveBeenLastCalledWith({
      address: 'Line 1,Line 2,Line 3',
    });
  });
});
