import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export type AuthenticatedCallableContext = Required<
  functions.https.CallableContext
>;

type AuthenticatedHandler = (
  data: any,
  context: AuthenticatedCallableContext
) => any | Promise<any>;

export function onAuthenticatedCall(handler: AuthenticatedHandler) {
  return functions.https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'must be authenticated'
      );
    }
    return await handler(data, context as AuthenticatedCallableContext);
  });
}

export const anyOf = (...required: string[]) => (userRoles: string[]) => {
  return required.some((r) => userRoles.includes(r));
};

export const allOf = (...required: string[]) => (userRoles: string[]) => {
  return required.every((r) => userRoles.includes(r));
};

export const onAuthorizedCall = (assertion: (roles: string[]) => boolean) => (
  handler: AuthenticatedHandler
) => {
  return functions.https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'must be authenticated'
      );
    }
    const userDoc = await admin
      .firestore()
      .collection('auth')
      .doc(context.auth.uid)
      .get();
    if (!userDoc.exists || !assertion(userDoc.data()!.roles || [])) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'permission-denied'
      );
    }
    return await handler(data, context as AuthenticatedCallableContext);
  });
};
