import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import extractorPipeline from './pipeline';
import { isReady } from './pipeline';
import { PubSub } from '@google-cloud/pubsub';
import { TextDetectionResultMessage } from '../detectText';

export const extractReceipt = functions.pubsub
  .topic('extraction')
  .onPublish(async (message) => {
    const data: TextDetectionResultMessage = message.json;
    if (!data.text || !data.userId || !data.fileName) {
      console.error('Got invalid message:', data);
      return;
    }
    const receiptId = data.fileName;
    const result = await extractorPipeline(data.text);
    await admin
      .firestore()
      .collection('receiptsByUser')
      .doc(data.userId)
      .collection('receipts')
      .doc(receiptId)
      .set(
        {
          result,
        },
        {
          merge: true,
        }
      );
    return new PubSub().topic('tagging').publish(
      Buffer.from(
        JSON.stringify({
          userId: data.userId,
          receiptId,
        })
      )
    );
  });

export const receiptStateUpdater = functions.firestore
  .document('receiptsByUser/{userId}/receipts/{receiptId}')
  .onUpdate(async (change, context) => {
    const receipt = change.after.data()!;
    if (!receipt.result || !receipt.result.data) {
      return;
    }
    if (
      receipt.result.state !== 'ready' &&
      receipt.result.state !== 'partial'
    ) {
      return;
    }
    const newState = isReady(receipt.result.data) ? 'ready' : 'partial';
    if (receipt.result.state === newState) {
      return;
    }
    return admin
      .firestore()
      .collection('receiptsByUser')
      .doc(context.params.userId)
      .collection('receipts')
      .doc(context.params.receiptId)
      .update({
        'result.state': newState,
      });
  });
