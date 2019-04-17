import './setup';

import * as admin from 'firebase-admin';

admin.initializeApp();

export { detectText } from './detectText';
export { analyseReceiptText } from './extract';
export { tagging } from './tagging';
export {
  receiptsToBigQuery,
  recurringPaymentsToBigQuery,
} from './big-query-export';
