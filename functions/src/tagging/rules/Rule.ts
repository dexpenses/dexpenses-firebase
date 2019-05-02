import { Condition } from '@dexpenses/rule-conditions';

export interface Rule {
  condition: Condition;
  tags: string[];
}
