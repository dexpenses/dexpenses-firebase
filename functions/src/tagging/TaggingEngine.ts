import * as admin from 'firebase-admin';
import { Receipt } from '@dexpenses/core';
import { placeTypeMappings } from '@dexpenses/core';
import { Rule } from './rules/Rule';
import ruleEngine from './rules/engine';
import { parseCondition } from '@dexpenses/rule-conditions';

export default class TaggingEngine {
  constructor(private rules: Rule[]) {}

  tag(receipt: Receipt): string[] {
    const tags = new Set<string>();
    if (receipt.place && receipt.place.types) {
      receipt.place.types.forEach((placeType) => {
        const tag = placeTypeMappings[placeType];
        if (!tag) {
          return;
        }
        tags.add(tag);
      });
    }
    ruleEngine(receipt, this.rules).forEach((tag) => tags.add(tag));
    return Array.from(tags);
  }

  static async loadForUser(userId: string) {
    const rules = await admin
      .firestore()
      .collection(`rulesByUser/${userId}/rules`)
      .get();
    return new TaggingEngine(
      rules.docs.map((ruleDoc) => {
        const rule = ruleDoc.data();
        return { ...rule, condition: parseCondition(rule.condition) } as Rule;
      })
    );
  }
}
