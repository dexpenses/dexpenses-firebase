import { ImageAnnotatorClient } from '@google-cloud/vision';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { basename, dirname } from 'path';
import { PubSub } from '@google-cloud/pubsub';

interface TextDetectionResult {
  state: 'error' | 'no-text' | 'success';
  error?: Status;
  text?: string;
}

export interface TextDetectionResultMessage {
  text: string;
  userId: string;
  fileName: string;
}

interface AnnotateImageResponse {
  error?: Status;
  fullTextAnnotation?: TextAnnotation;
}
interface Status {
  code?: number;
  details?: Array<Record<string, any>>;
  message?: string;
}
interface TextAnnotation {
  text?: string;
}

function processVisionResult(
  result: AnnotateImageResponse
): TextDetectionResult {
  if (result.error) {
    return {
      state: 'error',
      error: result.error,
    };
  }
  if (!result.fullTextAnnotation || !result.fullTextAnnotation.text) {
    return {
      state: 'no-text',
    };
  }
  return {
    state: 'success',
    text: result.fullTextAnnotation.text,
  };
}

export async function runTextDetection(gsUrl: string) {
  const client = new ImageAnnotatorClient();
  const [annotateImageResponse] = await client.textDetection(gsUrl);
  return processVisionResult(annotateImageResponse);
}

export const detectText = functions.storage
  .object()
  .onFinalize(async (object) => {
    const userId = basename(dirname(object.name!));
    const fileName = basename(object.name!);
    const result = await runTextDetection(
      `gs://${object.bucket}/${object.name}`
    );
    if (result.state !== 'success') {
      return admin
        .firestore()
        .collection('detectionErrorsByUser')
        .doc(userId)
        .collection('detectionErrors')
        .doc(fileName)
        .set(result);
    }
    const message: TextDetectionResultMessage = {
      text: result.text!,
      userId,
      fileName,
    };
    return new PubSub()
      .topic('extraction')
      .publish(Buffer.from(JSON.stringify(message)));
  });
