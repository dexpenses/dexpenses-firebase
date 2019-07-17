import * as functions from 'firebase-functions';
import * as Octokit from '@octokit/rest';
import { onAuthorizedCall, anyOf } from '../https';
import { validateNotBlank, validateRequired } from '../validation';
import { runTextDetection } from '../detect-text';

export interface TestDataInfo {
  category: string;
  cityCode: string;
  name: string;
  classifier?: string;
  paymentMethod: string;
}

function validateTestDataInfo(info: Partial<TestDataInfo>): TestDataInfo {
  validateRequired(info);
  validateNotBlank(info.category, 'category');
  validateNotBlank(info.cityCode, 'cityCode');
  validateNotBlank(info.name, 'name');
  validateNotBlank(info.paymentMethod, 'paymentMethod');
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
    const info = validateTestDataInfo(data);

    const auth = functions.config().github.bot.key;
    const octokit = new Octokit({
      auth,
    });

    const identifier = buildIdentifier(info);
    await octokit.repos.createOrUpdateFile({
      owner: 'dexpenses',
      repo: 'dexpenses-extract',
      content: Buffer.from(data.content).toString('base64'),
      path: `test/data/${identifier}.txt.inactive`,
      message: `🤖 Added ${identifier} test file`,
    });
    console.log(`Added ${identifier} test file`);
    return { success: true };
  }
);

export const manualTextDetection = onAuthorizedCall(anyOf('contributor'))(
  async (data, context) => {
    validateNotBlank(data.url, 'url');
    return await runTextDetection(data.url);
  }
);
