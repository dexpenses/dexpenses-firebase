import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import extractorPipeline from './pipeline';

export const analyseReceiptText = functions.firestore
  .document('receiptTextsByUser/{userId}/receiptTexts/{receiptId}')
  .onCreate((snap, context) => {
    const data = snap.data();
    const result = extractorPipeline((data || {}).text);
    return admin
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
  });
