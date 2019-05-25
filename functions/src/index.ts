import './setup';

import * as admin from 'firebase-admin';

admin.initializeApp();

export * from './detectText';
export * from './extract';
export * from './receipt-state-updater';
export * from './delete-image-on-receipt-delete';
export * from './tagging';
export * from './big-query-export';
export * from './big-query';
