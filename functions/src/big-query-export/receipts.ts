import * as functions from 'firebase-functions';
import { latLngToGeography } from './util';
import dataset from './dataset';
import { fromSnapshotChange, BigQueryRow } from './row';
import { Geography } from '@google-cloud/bigquery';

export interface BigQueryReceipt extends BigQueryRow {
  user_id: string;
  receipt_id: string;
  tags?: string[];
  amount?: number;
  currency?: string;
  payment_method?: string;
  location?: Geography;
  timestamp?: Date;
  header?: string[];
}

export const receiptsToBigQuery = functions.firestore
  .document('receiptsByUser/{userId}/receipts/{receiptId}')
  .onWrite(async (snap, context) => {
    const userId = context.params.userId;
    const receiptId = context.params.receiptId;
    let row: BigQueryReceipt = {
      ...fromSnapshotChange(snap),
      user_id: userId,
      receipt_id: receiptId,
    };
    if (snap.after.exists) {
      const data = snap.after.data()!;
      if (!data.result || !data.result.data) {
        return;
      }
      const receipt = data.result.data;
      const place = receipt.place;
      row = {
        ...row,
        tags: data.tags || [],
        amount: (receipt.amount || {}).value,
        currency: (receipt.amount || {}).currency,
        payment_method: receipt.paymentMethod,
        location:
          place && place.geometry
            ? latLngToGeography(place.geometry.location)
            : undefined,
        timestamp: receipt.timestamp ? receipt.timestamp.toDate() : null,
        header: receipt.header || [],
      };
    }

    try {
      await dataset.table('receipts').insert(row);
    } catch (e) {
      console.error(JSON.stringify(e));
      throw e;
    }
  });
