import { readFileSync } from 'fs';
import { resolve } from 'path';

export interface PlaceTypeInferer {
  [key: string]: string[];
}
export const placeTypeInference: PlaceTypeInferer = read();

function read() {
  return readFileSync(resolve(__dirname, 'place-types.properties'), {
    encoding: 'utf8',
  })
    .split('\n')
    .reduce((acc, cur) => {
      const [placeType, inferences] = cur.split('=');
      acc[placeType] = (inferences || '').split(',');
      return acc;
    }, {});
}
