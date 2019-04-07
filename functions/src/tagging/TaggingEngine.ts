import { Receipt } from '../extract/receipt';
import { placeTypeInference } from './PlaceTypeInferer';
import { Rule } from './rules/Rule';
import ruleEngine from './rules/engine';

export default class TaggingEngine {
  constructor(private rules: Rule[]) {}

  tag(receipt: Receipt): string[] {
    const tags = new Set();
    if (receipt.place && receipt.place.types) {
      receipt.place.types
        .flatMap((pt) => placeTypeInference[pt] || [])
        .forEach((tag) => tags.add(tag));
    }
    ruleEngine(receipt, this.rules).forEach((tag) => tags.add(tag));
    return Array.from(tags);
  }
}
