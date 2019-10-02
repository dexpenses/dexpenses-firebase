import './setup';

import * as admin from 'firebase-admin';

admin.initializeApp();

export * from './detect-text';
export * from './extract';
export * from './receipt-state-updater';
export * from './delete-image-on-receipt-delete';
export * from './tagging';
export * from './export/big-query';
export * from './export/mongo';

export * from './query';
export * from './search';
export * from './admin';
