import { LatLngLiteral } from '@google/maps';
import { Amount, PaymentMethod, Timestamp } from '@dexpenses/core';

export default interface Receipt {
  userId: string;
  receiptId: string;
  tags?: string[] | null;
  amount?: Amount | null;
  paymentMethod?: PaymentMethod | null;
  location?: LatLngLiteral | null;
  timestamp?: Date | Timestamp | null;
  header?: string[] | null;
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
