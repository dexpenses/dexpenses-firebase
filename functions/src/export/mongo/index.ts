import * as functions from 'firebase-functions';
import Receipt, { Mapper, mapTimestamp } from '../Receipt';
import { Amount, PaymentMethod } from '@dexpenses/core';
import { MongoClient, Collection } from 'mongodb';
import { Point } from 'geojson';
import { ReceiptRecord } from '../../model';

async function exec(
  handler: (collection: Collection, client: MongoClient) => Promise<any>
) {
  const client = await MongoClient.connect(functions.config().mongo.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    return handler(client.db('dexpenses').collection('receipts'), client);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

interface MongoReceipt {
  _id: { user: string; receipt: string };
  amount?: Amount | null;
  paymentMethod?: PaymentMethod | null;
  timestamp?: Date | null;
  header?: string[] | null;
  tags?: string[] | null;
  location?: Point | null;
}
const mongoReceiptMapper: Mapper<MongoReceipt> = {
  toExportType(receipt: Receipt): MongoReceipt {
    const {
      receiptId,
      userId,
      amount,
      header,
      timestamp,
      paymentMethod,
      tags,
      location,
    } = receipt;
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
      location: location && {
        type: 'Point',
        coordinates: [location.lng, location.lat],
      },
    };
  },

  fromExportType(exported: MongoReceipt): Receipt {
    const {
      _id,
      amount,
      header,
      location,
      paymentMethod,
      tags,
      timestamp,
    } = exported;
    return {
      userId: _id.user,
      receiptId: _id.receipt,
      amount,
      header,
      paymentMethod,
      tags,
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
      return exec((col) =>
        col.deleteOne({
          _id: {
            user: userId,
            receipt: receiptId,
          },
        })
      );
    }
    const { result, tags } = change.after.data()! as ReceiptRecord;
    if (result.state !== 'ready') {
      // todo delete if changed to un-ready
      return;
    }
    const data = mongoReceiptMapper.toExportType({
      userId,
      receiptId,
      tags,
      ...result.data,
    });
    return exec((col) =>
      col.updateOne({ _id: data._id }, data, { upsert: true })
    );
  });
