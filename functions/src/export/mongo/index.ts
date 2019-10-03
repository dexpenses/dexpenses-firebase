import * as functions from 'firebase-functions';
import { Point } from 'geojson';
import { Amount, PaymentMethod } from '@dexpenses/core';
import Receipt, { Mapper, mapTimestamp } from '../Receipt';
import { ReceiptRecord } from '../../model';
import mongo from '../../mongo';
import { ReceiptResultState } from '@dexpenses/extract';

export interface MongoReceipt {
  _id: { user: string; receipt: string };
  amount?: Amount | null;
  paymentMethod?: PaymentMethod | null;
  timestamp?: Date | null;
  header?: string[] | null;
  tags?: string[] | null;
  location?: Point | null;
  state: ReceiptResultState;
}
const mongoReceiptMapper: Mapper<MongoReceipt> = {
  toExportType({
    receiptId,
    userId,
    amount,
    header,
    timestamp,
    paymentMethod,
    tags,
    location,
    state,
  }: Receipt): MongoReceipt {
    return {
      _id: {
        user: userId,
        receipt: receiptId,
      },
      amount,
      header,
      timestamp: mapTimestamp(timestamp),
      paymentMethod,
      tags,
      state,
      location: location && {
        type: 'Point',
        coordinates: [location.lng, location.lat],
      },
    };
  },

  fromExportType({
    _id,
    amount,
    header,
    location,
    paymentMethod,
    tags,
    timestamp,
    state,
  }: MongoReceipt): Receipt {
    return {
      userId: _id.user,
      receiptId: _id.receipt,
      amount,
      header,
      paymentMethod,
      tags,
      state,
      timestamp,
      location: location && {
        lng: location.coordinates[0],
        lat: location.coordinates[1],
      },
    };
  },
};

export const exportMongoReceipts = functions.firestore
  .document('receiptsByUser/{userId}/receipts/{receiptId}')
  .onWrite(async (change, context) => {
    const userId = context.params.userId;
    const receiptId = context.params.receiptId;
    if (!change.after.exists) {
      return mongo.receipts((col) =>
        col.deleteOne({
          _id: {
            user: userId,
            receipt: receiptId,
          },
        })
      );
    }
    const receipt = change.after.data()! as ReceiptRecord;
    const data = mongoReceiptMapper.toExportType(
      Receipt.of(userId, receiptId, receipt)
    );

    return mongo.receipts((col) =>
      col.updateOne({ _id: data._id }, data, { upsert: true })
    );
  });
