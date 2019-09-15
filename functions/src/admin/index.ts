import { extname } from 'path';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as Octokit from '@octokit/rest';
import { onAuthorizedCall, anyOf } from '../https';
import { validateNotBlank, validateRequired } from '../validation';
import { runTextDetection } from '../detect-text';
import { PaymentMethod, paymentMethods } from '@dexpenses/core';
import { parseGSUrl } from '../util/gsutil';

export const testImageBucket = 'dexpenses-207219-test-images';
export const testImageUploadBucket = 'dexpenses-207219-test-image-upload';

export interface TestDataInfo {
  category: string;
  cityCode: string;
  name: string;
  classifier?: string;
  paymentMethod?: PaymentMethod;
}

function validateTestDataInfo(
  info: Partial<TestDataInfo> & { paymentMethod?: string }
): TestDataInfo {
  validateRequired(info);
  validateNotBlank(info.category, 'category');
  validateNotBlank(info.cityCode, 'cityCode');
  validateNotBlank(info.name, 'name');
  if (
    info.paymentMethod &&
    !paymentMethods.includes(
      info.paymentMethod.trim().toUpperCase() as PaymentMethod
    )
  ) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'invalid payment method'
    );
  }
  return info as TestDataInfo;
}

export function buildIdentifier(info: TestDataInfo): string {
  return (
    info.category +
    '/' +
    [info.cityCode, info.name, info.classifier, info.paymentMethod]
      .map((s) => s && s.trim())
      .filter((p) => !!p)
      .map((s) => s!.toLowerCase().replace(/\s+/g, '-'))
      .join('-')
  );
}

export const addTestDataFile = onAuthorizedCall(anyOf('contributor'))(
  async (data, context) => {
    validateNotBlank(data.content, 'content');
    validateNotBlank(data.path, 'path');
    const info = validateTestDataInfo(data);

    const auth = functions.config().github.bot.key;
    const octokit = new Octokit({
      auth,
    });
    const owner = 'dexpenses';
    const repo = 'dexpenses-extract';
    const identifier = buildIdentifier(info);
    await octokit.repos.createOrUpdateFile({
      owner,
      repo,
      content: Buffer.from(data.content).toString('base64'),
      path: `test/data/${identifier}.txt.inactive`,
      message: `[skip ci] 🤖 Added ${identifier} test file`,
    });
    const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${testImageBucket}/o/${encodeURIComponent(
      identifier
    )}${extname(data.path)}?alt=media`;
    await octokit.issues.create({
      owner,
      repo,
      title: `Implement test receipt ${identifier}`,
      labels: ['enhancement', 'test-data'],
      body:
        'Receipt to implement:\n' +
        `![${identifier}](${imageUrl} "${identifier}")`,
    });
    console.log(`Added ${identifier} test file`);
    return { success: true };
  }
);

function validateGSUrl(uid: string, rawUrl: string) {
  const url = parseGSUrl(rawUrl);
  if (!url || !url.filename) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'invalid GS url'
    );
  }
  if (url.bucket !== testImageBucket) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'permission-denied'
    );
  }
}

export const manualTextDetection = onAuthorizedCall(anyOf('contributor'))(
  async (data, context) => {
    validateNotBlank(data.url, 'url');
    validateGSUrl(context.auth.uid, data.url);
    return await runTextDetection(data.url);
  }
);

export const moveTestDataImage = onAuthorizedCall(anyOf('contributor'))(
  async (data, context) => {
    validateNotBlank(data.source, 'source');
    const info = validateTestDataInfo(data);
    const identifier = buildIdentifier(info);
    await admin
      .storage()
      .bucket(testImageUploadBucket)
      .file(data.source)
      .move(admin.storage().bucket(testImageBucket).file(`${identifier}${extname(data.source)}`));
    return { success: true };
  }
);
