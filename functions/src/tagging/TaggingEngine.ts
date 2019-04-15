import { Receipt } from '../extract/receipt';
import placeTypes from './place-types';
import { Rule } from './rules/Rule';
import ruleEngine from './rules/engine';

function inferTagFromPlaceType(placeType: string): string[] {
  const infered = placeTypes[placeType];
  if (infered) {
    return [infered];
  }
  return [];
}

export default class TaggingEngine {
  constructor(private rules: Rule[]) {}

  tag(receipt: Receipt): string[] {
    const tags = new Set();
    if (receipt.place && receipt.place.types) {
      receipt.place.types
        .flatMap((pt) => inferTagFromPlaceType(pt))
        .forEach((tag) => tags.add(tag));
    }
    ruleEngine(receipt, this.rules).forEach((tag) => tags.add(tag));
    return Array.from(tags);
  }
}
