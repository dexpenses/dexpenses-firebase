import * as functions from 'firebase-functions';

export function onAuthenticatedCall(
  handler: (
    data: any,
    context: Required<functions.https.CallableContext>
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
