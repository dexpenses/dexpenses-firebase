import * as functions from 'firebase-functions';

export type AuthenticatedCallableContext = Required<
  functions.https.CallableContext
>;

export function onAuthenticatedCall(
  handler: (
    data: any,
    context: AuthenticatedCallableContext
  ) => any | Promise<any>
) {
  return functions.https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'must be authenticated'
      );
    }
    return await handler(data, context as any);
  });
}
