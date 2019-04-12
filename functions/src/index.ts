import './setup';

import * as admin from 'firebase-admin';

admin.initializeApp();

export { detectText } from './detectText';
export { analyseReceiptText } from './extract';
