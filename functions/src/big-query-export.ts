import * as functions from 'firebase-functions';
import { BigQuery, Geography } from '@google-cloud/bigquery';
import { Timestamp } from '@google-cloud/firestore';

function extractLocationGeography(receipt: any): Geography | undefined {
  const place = receipt.place;
  if (!place || !place.geometry || !place.geometry.location) {
    return undefined;
  }
  const { lng, lat } = place.geometry.location;
  if (!lng || !lat) {
    return undefined;
  }
  return BigQuery.geography(`POINT(${lng} ${lat})`);
}

interface BigQueryReceipt {
  user_id: string;
  receipt_id: string;
  tags?: string[];
  amount?: number;
  currency?: string;
  payment_method?: string;
  location?: Geography;
  timestamp?: Date;
  header?: string[];
  bq_inserted_at: Date;
  bq_op: 'D' | 'I';
}

export const receiptsToBigQuery = functions.firestore
  .document('receiptsByUser/{userId}/receipts/{receiptId}')
  .onWrite(async (snap, context) => {
    const bigQuery = new BigQuery();
    const userId = context.params.userId;
    const receiptId = context.params.receiptId;
    let row: BigQueryReceipt = {
      user_id: userId,
      receipt_id: receiptId,
      bq_inserted_at: (
        snap.after.updateTime ||
        snap.after.createTime ||
        Timestamp.now()
      ).toDate(),
      bq_op: !snap.after.exists ? 'D' : 'I',
    };
    if (snap.after.exists) {
      const data = snap.after.data() as any;
      const receipt = data.result.data || {};
      row = {
        ...row,
        tags: data.tags,
        amount: (receipt.amount || {}).value,
        currency: (receipt.amount || {}).currency,
        payment_method: receipt.paymentMethod,
        location: extractLocationGeography(receipt),
        timestamp: receipt.timestamp ? receipt.timestamp.toDate() : null,
        header: receipt.header,
      };
    }

    try {
      await bigQuery
        .dataset('dexpenses_bi')
        .table('receipts')
        .insert(row);
    } catch (e) {
      console.error(JSON.stringify(e));
      throw e;
    }
  });
