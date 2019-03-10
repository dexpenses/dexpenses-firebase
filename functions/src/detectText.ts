import * as vision from '@google-cloud/vision';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as path from 'path';
import { ReceiptResult } from './extract/receipt';

const BAD_IMAGE = 3;

export const detectText = functions.storage
  .object()
  .onFinalize(async (object) => {
    if (!object.name) {
      return;
    }
    const userId = path.basename(path.dirname(object.name));
    const fileName = path.basename(object.name);
    console.log('OCR', userId, fileName);
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.documentTextDetection(
      `gs://${object.bucket}/${object.name}`
    );
    if (result.error) {
      await admin
        .storage()
        .bucket()
        .file(object.name)
        .delete();
      let receiptResult: ReceiptResult;
      if (result.error.code === BAD_IMAGE) {
        receiptResult = {
          state: 'bad-image',
        };
      } else {
        receiptResult = {
          state: 'error',
          error: result.error,
        };
      }
      return admin
        .firestore()
        .collection('receiptsByUser')
        .doc(userId)
        .collection('receipts')
        .doc(fileName)
        .set(receiptResult, {
          merge: true,
        });
    }
    const fullTextAnnotation = result.fullTextAnnotation;
    if (!fullTextAnnotation) {
      return admin
        .firestore()
        .collection('receiptsByUser')
        .doc(userId)
        .collection('receipts')
        .doc(fileName)
        .set(
          {
            state: 'no-text',
          } as ReceiptResult,
          {
            merge: true,
          }
        );
    }
    return admin
      .firestore()
      .collection('receiptTextsByUser')
      .doc(userId)
      .collection('receiptTexts')
      .doc(fileName)
      .set({
        text: fullTextAnnotation.text,
      });
  });
