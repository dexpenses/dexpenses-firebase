import * as functions from 'firebase-functions';
import { latLngToGeography, geographyToLatLng } from './util';
import dataset from './dataset';
import { fromSnapshotChange, BigQueryRow } from './row';
import { Geography } from '@google-cloud/bigquery';
import Receipt, { Mapper, mapTimestamp } from '../Receipt';
import { PaymentMethod } from '@dexpenses/core';
import { ReceiptRecord } from '../../model';
import { ReceiptResultState } from '@dexpenses/extract';

export interface BigQueryReceipt extends BigQueryRow {
  user_id: string;
  receipt_id: string;
  tags: string[];
  amount?: number | null;
  currency?: string | null;
  payment_method?: PaymentMethod | null;
  location?: Geography | null;
  timestamp?: Date | null;
  header: string[];
  state: ReceiptResultState;
}

const mapper: Mapper<BigQueryReceipt> = {
  toExportType(receipt: Receipt, args?: BigQueryRow): BigQueryReceipt {
    const {
      receiptId,
      userId,
      amount,
      header,
      timestamp,
      paymentMethod,
      tags,
      location,
      state,
    } = receipt;
    return {
      user_id: userId,
      receipt_id: receiptId,
      amount: amount && amount.value,
      currency: amount && amount.currency,
      header: header || [],
      timestamp: mapTimestamp(timestamp),
      payment_method: paymentMethod,
      tags: tags || [],
      state,
      location: location && latLngToGeography(location),
      bq_op: args!.bq_op,
      bq_inserted_at: args!.bq_inserted_at,
    };
  },
  fromExportType(exported: BigQueryReceipt): Receipt {
    const {
      user_id,
      receipt_id,
      amount,
      currency,
      header,
      location,
      payment_method,
      tags,
      timestamp,
      state,
    } = exported;
    return {
      userId: user_id,
      receiptId: receipt_id,
      tags,
      paymentMethod: payment_method,
      timestamp,
      header,
      state,
      location: location && geographyToLatLng(location),
      amount:
        (amount &&
          currency && {
            value: amount,
            currency,
          }) ||
        undefined,
    };
  },
};

export const exportBigQueryReceipts = functions.firestore
  .document('receiptsByUser/{userId}/receipts/{receiptId}')
  .onWrite(async (snap, context) => {
    const userId = context.params.userId;
    const receiptId = context.params.receiptId;
    const args = fromSnapshotChange(snap);
    const data = snap.after.exists ? snap.after.data()! : snap.before.data()!;
    const receipt = data as ReceiptRecord;
    const row = mapper.toExportType(
      Receipt.of(userId, receiptId, receipt),
      args
    );
    try {
      await dataset.table('receipts').insert(row);
    } catch (e) {
      console.error(JSON.stringify(e));
      throw e;
    }
  });