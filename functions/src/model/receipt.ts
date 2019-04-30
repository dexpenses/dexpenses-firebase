import { GeocodingResult, PlaceDetailsResult } from '@google/maps';

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

export interface Address {
  zip?: string | null;
  city?: string | null;
  street?: string | null;
}

export interface Time {
  hour: number;
  minute: number;
  second?: number | null;
}

export interface Amount {
  value: number;
  currency: 'EUR' | 'USD' | 'GBP';
}

export interface Receipt {
  header?: string[];
  time?: Time;
  phone?: string;
  paymentMethod?: string;
  date?: Date;
  amount?: { value: number; currency: string };
  address?: Address;
  timestamp?: Date;
  place?: GeocodingResult & PlaceDetailsResult;
}
