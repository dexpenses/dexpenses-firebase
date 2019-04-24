import './setup';

import * as admin from 'firebase-admin';

admin.initializeApp();

export { detectText } from './detectText';
export { extractReceipt } from './extract';
export { receiptStateUpdater } from './receipt-state-updater';
export { deleteImageOnReceiptDelete } from './delete-image-on-receipt-delete';
export { tagging } from './tagging';
export {
  receiptsToBigQuery,
  recurringPaymentsToBigQuery,
} from './big-query-export';
