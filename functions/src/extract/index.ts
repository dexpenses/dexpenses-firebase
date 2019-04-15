import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import extractorPipeline from './pipeline';
import { TaggingMessage } from '../tagging';

export const analyseReceiptText = functions.firestore
  .document('receiptTextsByUser/{userId}/receiptTexts/{receiptId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const result = await extractorPipeline((data || {}).text);
    await admin
      .firestore()
      .collection('receiptsByUser')
      .doc(context.params.userId)
      .collection('receipts')
      .doc(context.params.receiptId)
      .set(
        {
          result,
        },
        {
          merge: true,
        }
      );
    const taggingMessage: TaggingMessage &
      admin.messaging.DataMessagePayload = {
      userId: context.params.userId,
      receiptId: context.params.receiptId,
    };
    return admin.messaging().sendToTopic('tagging', { data: taggingMessage });
  });
