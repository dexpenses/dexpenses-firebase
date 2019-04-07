import { Receipt } from '../../extract/receipt';
import { Rule } from './Rule';

export default function(receipt: Receipt, rules: Rule[]): string[] {
  return Array.from(
    new Set(
      rules.flatMap((rule) => (rule.condition.test(receipt) ? rule.tags : []))
    )
  );
}
