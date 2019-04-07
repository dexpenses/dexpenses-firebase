export type Operator = '<' | '<=' | '==' | '>' | '>=';

export function parseOperator(op: Operator): (x: number, y: number) => boolean {
  switch (op) {
    case '<':
      return (x, y) => x < y;
    case '<=':
      return (x, y) => x <= y;
    case '==':
      return (x, y) => x === y;
    case '>=':
      return (x, y) => x >= y;
    case '>':
      return (x, y) => x > y;
    default:
      throw new Error('unknown operator');
  }
}
