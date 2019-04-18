import * as admin from 'firebase-admin';
import { Receipt } from '../extract/receipt';
import placeTypes from './place-types';
import { Rule } from './rules/Rule';
import ruleEngine from './rules/engine';
import { parseCondition } from '@dexpenses/rule-conditions';

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

  static async loadForUser(userId: string) {
    const rules = await admin
      .firestore()
      .collection('rulesByUser')
      .doc(userId)
      .collection('rules')
      .get();
    return new TaggingEngine(
      rules.docs.map((rule) => {
        const r = rule.data();
        r.condition = parseCondition(r.condition);
        return r as Rule;
      })
    );
  }
}
