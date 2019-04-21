import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { FieldValue } from '@google-cloud/firestore';
import TaggingEngine from './TaggingEngine';
import { Receipt } from '@dexpenses/rule-conditions';

export interface TaggingMessage {
  userId: string;
  receiptId: string;
  result: { data: Receipt };
}

export const tagging = functions.pubsub
  .topic('tagging')
  .onPublish(async (message) => {
    const data: TaggingMessage = message.json;
    if (!data.userId || !data.receiptId || !data.result || !data.result.data) {
      throw new Error(`Invalid message: ${JSON.stringify(data)}`);
    }
    const taggingEngine = await TaggingEngine.loadForUser(data.userId);
    const tags = taggingEngine.tag(data.result.data as any);
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
