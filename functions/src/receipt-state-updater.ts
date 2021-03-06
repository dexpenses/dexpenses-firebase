import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { isReceiptReady } from '@dexpenses/extract';

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
    const newState = isReceiptReady(receipt.result.data) ? 'ready' : 'partial';
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
