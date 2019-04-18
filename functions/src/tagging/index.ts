import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { FieldValue } from '@google-cloud/firestore';
import { Receipt } from '@dexpenses/rule-conditions';
import TaggingEngine from './TaggingEngine';

export interface TaggingMessage {
  userId: string;
  receiptId: string;
}

export const tagging = functions.pubsub
  .topic('tagging')
  .onPublish(async (message) => {
    const data: TaggingMessage = message.json;
    const receiptRef = await admin
      .firestore()
      .collection('receiptsByUser')
      .doc(data.userId)
      .collection('receipts')
      .doc(data.receiptId)
      .get();
    if (!receiptRef.exists) {
      console.error('Invalid tagging request: Receipt does not exist');
      return;
    }
    const receipt = receiptRef.data()!;
    if (!receipt.result || !receipt.result.data) {
      console.log(`Not tagging ${data.userId}/${data.receiptId}: no data.`);
      return;
    }
    const taggingEngine = await TaggingEngine.loadForUser(data.userId);
    const tags = taggingEngine.tag(receiptRef.data()!.result.data as Receipt);
    if (tags.length === 0) {
      return;
    }
    return admin
      .firestore()
      .collection('receiptsByUser')
      .doc(data.userId)
      .collection('receipts')
      .doc(data.receiptId)
      .update({
        tags: FieldValue.arrayUnion(...tags),
      });
  });
