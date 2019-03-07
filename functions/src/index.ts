import * as functions from 'firebase-functions';
import * as vision from '@google-cloud/vision';
import * as admin from 'firebase-admin';
import * as path from 'path';
import extractorPipeline from './extract/pipeline';

admin.initializeApp();

export const detectText = functions.storage.object().onFinalize(async object => {
  if (!object.name) {
    return;
  }
  const userId = path.basename(path.dirname(object.name));
  const fileName = path.basename(object.name);
  console.log('OCR', userId, fileName);
  const client = new vision.ImageAnnotatorClient();
  const [result] = await client.documentTextDetection(`gs://${object.bucket}/${object.name}`);
  const fullTextAnnotation = result.fullTextAnnotation;
  return admin.firestore()
    .collection('receiptTextsByUser').doc(userId).collection('receiptTexts')
    .doc(fileName)
    .set(
      {
        text: fullTextAnnotation.text
      }
    );
});

export const analyseReceiptText = functions.firestore.document('receiptTextsByUser/{userId}/receiptTexts/{receiptId}')
  .onCreate((snap, context) => {
    const data = snap.data();
    const result = extractorPipeline((data || {}).text);
    return admin.firestore()
      .collection('receiptsByUser').doc(context.params.userId)
      .collection('receipts').doc(context.params.receiptId)
      .set({
        result
      }, {
          merge: true,
        });
  });
