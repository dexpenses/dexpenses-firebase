import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as gmaps from '@google/maps';
import { Address } from './extract/address';

export interface GoogleMapsStageData {
  userId: string;
  receiptId: string;
  address: Address;
  header: string[];
}

export const gmapStage = functions.pubsub
  .topic('gmap-stage')
  .onPublish(async (message) => {
    const data: GoogleMapsStageData = message.json;
    const client = gmaps.createClient({
      key: functions.config().gmaps.key,
      Promise,
    });
    const res = await client
      .geocode({
        address: buildAddressQuery(data.header, data.address),
      })
      .asPromise();
    const result = res.json.results[0];
    return admin
      .firestore()
      .collection('receiptsByUser')
      .doc(data.userId)
      .collection('receipts')
      .doc(data.receiptId)
      .set(
        {
          result: {
            gmapResult: result,
          },
        },
        { merge: true }
      );
  });

function buildAddressQuery(header: string[], address: Address): string {
  if (address.street && address.city) {
    return `${header.join(',')}, ${address.street}, ${address.city}`;
  }
  return header.join(',');
}
