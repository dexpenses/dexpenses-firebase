import { Receipt } from '@dexpenses/core';
import { Rule } from './Rule';

export default function(receipt: Receipt, rules: Rule[]): string[] {
  return Array.from(
    new Set(
      rules.flatMap((rule) =>
        rule.condition.test(receipt as any) ? rule.tags : []
      )
    )
  );
}
