import './setup';

import * as admin from 'firebase-admin';

admin.initializeApp();

export { detectText } from './detectText';
export { extractReceipt, receiptStateUpdater } from './extract';
export { deleteImageOnReceiptDelete } from './delete-image-on-receipt-delete';
export { tagging } from './tagging';
export {
  receiptsToBigQuery,
  recurringPaymentsToBigQuery,
} from './big-query-export';
