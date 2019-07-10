import * as functions from 'firebase-functions';

export function validateNotBlank(value?: string | null, name?: string) {
  if (!value || !value.trim()) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      `${name || 'value'} cannot be blank`
    );
  }
}

export function validateRequired(value?: any, name?: string) {
  if (value === undefined || value === null) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      `required property ${name || ''} missing`
    );
  }
}
