import * as functions from 'firebase-functions';

export function fail(msg: string) {
  throw new functions.https.HttpsError('failed-precondition', msg);
}

export function validateNotBlank(value?: string | null, name?: string) {
  if (!value || !value.trim()) {
    fail(`${name || 'value'} cannot be blank`);
  }
}

export function validateRequired(value?: any, name?: string) {
  if (value === undefined || value === null) {
    fail(`required property ${name || ''} missing`);
  }
}

export function validateSet(
  value: any | undefined | null,
  set: any[],
  name?: string
) {
  if (!value) {
    return;
  }
  if (!set.includes(value)) {
    fail(`property ${name || ''} must be one of ${set}`);
  }
}
