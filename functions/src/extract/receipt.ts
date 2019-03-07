export interface ReceiptResult {
  state: 'pending' | 'no-text' | 'unreadable' | 'partial' | 'ready';
  data?: Receipt;
}

export interface Receipt {
  header?: string[];
  [field: string]: any;
}
