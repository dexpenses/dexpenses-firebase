export type ReceiptResultState =
  | 'pending'
  | 'no-text'
  | 'bad-image'
  | 'error'
  | 'unreadable'
  | 'partial'
  | 'ready';

export interface ReceiptResult {
  state: ReceiptResultState;
  data?: Receipt;
  error?: any;
}

export interface Time { hour: number; minute: number; second: number; }

export interface Receipt {
  header?: string[];
  time?: Time;
  phone?: string;
  paymentMethod?: string;
  date?: Date;
  amount?: { value: number; currency: string };
  address?: { street: string; city: string };
  timestamp?: Date;
}
