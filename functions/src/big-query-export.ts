import * as functions from 'firebase-functions';
import { BigQuery, Geography } from '@google-cloud/bigquery';
import { Timestamp } from '@google-cloud/firestore';
import { Change } from 'firebase-functions';
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';

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

interface BigQueryRow {
  bq_inserted_at: Date;
  bq_op: 'D' | 'I';
}

function fromSnapshotChange(snap: Change<DocumentSnapshot>): BigQueryRow {
  return {
    bq_inserted_at: (
      snap.after.updateTime ||
      snap.after.createTime ||
      Timestamp.now()
    ).toDate(),
    bq_op: !snap.after.exists ? 'D' : 'I',
  };
}

interface BigQueryReceipt extends BigQueryRow {
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
    const bigQuery = new BigQuery();
    const userId = context.params.userId;
    const receiptId = context.params.receiptId;
    let row: BigQueryReceipt = {
      ...fromSnapshotChange(snap),
      user_id: userId,
      receipt_id: receiptId,
    };
    if (snap.after.exists) {
      const data = snap.after.data() as any;
      const receipt = data.result.data;
      if (!receipt) {
        console.log(`No receipt data for ${userId}/${receiptId}`);
        return;
      }
      row = {
        ...row,
        tags: data.tags || [],
        amount: (receipt.amount || {}).value,
        currency: (receipt.amount || {}).currency,
        payment_method: receipt.paymentMethod,
        location: extractLocationGeography(receipt),
        timestamp: receipt.timestamp ? receipt.timestamp.toDate() : null,
        header: receipt.header || [],
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

interface BigQueryRecurringPayment extends BigQueryRow {
  payment_id: string;
  user_id: string;
  name?: string;
  description?: string;
  period?: 'Monthly' | 'Quarterly' | 'Yearly';
  c_period?: number;
  amount?: number;
  currency?: string;
  payment_method?: string;
  due?: string;
}

function resolvePaymentPeriod(period?: string): number | undefined {
  if (!period) {
    return undefined;
  }
  switch (period) {
    case 'Monthly':
      return 1;
    case 'Quarterly':
      return 4;
    case 'Yearly':
      return 12;
    default:
      return undefined;
  }
}

export const recurringPaymentsToBigQuery = functions.firestore
  .document('recurringPaymentsByUser/{userId}/recurringPayments/{paymentId}')
  .onWrite(async (snap, context) => {
    const bigQuery = new BigQuery();
    const userId = context.params.userId;
    const paymentId = context.params.paymentId;
    let row: BigQueryRecurringPayment = {
      ...fromSnapshotChange(snap),
      user_id: userId,
      payment_id: paymentId,
    };
    if (snap.after.exists) {
      const data = snap.after.data() as any;
      row = {
        ...row,
        name: data.name,
        description: data.description,
        amount: (data.amount || {}).value,
        currency: (data.amount || {}).currency,
        payment_method: data.paymentMethod,
        period: data.period,
        c_period: resolvePaymentPeriod(data.period),
      };
    }

    try {
      await bigQuery
        .dataset('dexpenses_bi')
        .table('recurring_payments')
        .insert(row);
    } catch (e) {
      console.error(JSON.stringify(e));
      throw e;
    }
  });
