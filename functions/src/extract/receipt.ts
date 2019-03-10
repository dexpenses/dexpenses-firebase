export type ReceiptResultState =
  | 'pending'
  | 'no-text'
  | 'unreadable'
  | 'partial'
  | 'ready';

export interface ReceiptResult {
  state: ReceiptResultState;
  data?: Receipt;
}

export type Time = { hour: number; minute: number; second: number };

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
