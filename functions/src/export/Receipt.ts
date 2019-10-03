import { LatLngLiteral } from '@google/maps';
import { Amount, PaymentMethod, Timestamp } from '@dexpenses/core';
import { ReceiptResultState } from '@dexpenses/extract';
import { ReceiptRecord } from '../model';

export default interface Receipt {
  userId: string;
  receiptId: string;
  tags?: string[] | null;
  amount?: Amount | null;
  paymentMethod?: PaymentMethod | null;
  location?: LatLngLiteral | null;
  timestamp?: Date | Timestamp | null;
  header?: string[] | null;
  state: ReceiptResultState;
}

export default class Receipt {
  static of(
    userId: string,
    receiptId: string,
    { result, tags }: ReceiptRecord
  ): Receipt {
    return {
      ...(result.data || {}),
      userId,
      receiptId,
      tags,
      state: result.state,
      location:
        result.data && result.data.place && result.data.place.geometry.location,
    };
  }
}

export function mapTimestamp(
  timestamp?: Date | Timestamp | null
): Date | undefined | null {
  if (!timestamp || timestamp instanceof Date) {
    return timestamp;
  }
  return timestamp.toDate();
}

export interface Mapper<T> {
  toExportType(receipt: Receipt, args?: any): T;
  fromExportType(exported: T): Receipt;
}
