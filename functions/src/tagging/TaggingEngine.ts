import { Receipt } from '../extract/receipt';
import { placeTypeInference } from './PlaceTypeInferer';
import { Rule } from './rules/Rule';

export default class TaggingEngine {
  constructor(private rules: Rule[]) {}

  tag(receipt: Receipt): string[] {
    let tags: string[] = [];
    if (receipt.place && receipt.place.types) {
      tags = receipt.place.types.flatMap((pt) => placeTypeInference[pt] || []);
    }
    this.rules.forEach((rule) => {
      if (rule.condition.test(receipt)) {
        tags = [...tags, ...rule.tags];
      }
    });
    return tags;
  }
}
