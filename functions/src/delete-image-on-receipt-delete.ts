import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export const deleteImageOnReceiptDelete = functions.firestore
  .document('receiptsByUser/{userId}/receipts/{receiptId}')
  .onDelete((snap, context) => {
    return admin
      .storage()
      .bucket('dexpenses-207219.appspot.com')
      .file(`images/${context.params.userId}/${context.params.receiptId}`)
      .delete();
  });
