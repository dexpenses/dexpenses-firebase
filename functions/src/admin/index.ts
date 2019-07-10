import * as functions from 'firebase-functions';
import * as Octokit from '@octokit/rest';
import { onAuthorizedCall, anyOf } from '../https';
import { validateNotBlank } from '../validation';

export const addTestDataFile = onAuthorizedCall(anyOf('contributor'))(
  async (data, context) => {
    const auth = functions.config().github['dexpenses-extract'].key;
    const octokit = new Octokit({
      auth,
    });
    const {
      content,
      category,
      cityCode,
      name,
      classifier,
      paymentMethod,
    } = data;
    validateNotBlank(content, 'content');
    validateNotBlank(category, 'category');
    validateNotBlank(cityCode, 'cityCode');
    validateNotBlank(name, 'name');

    let suffix = '';
    if (classifier) {
      suffix += '-' + classifier.toLowerCase();
    }
    if (paymentMethod) {
      suffix += '-' + paymentMethod.toLowerCase();
    }
    const identifier = `${category.toLowerCase()}/${cityCode.toLowerCase()}-${name.toLowerCase()}${suffix}`;
    await octokit.repos.createOrUpdateFile({
      owner: 'dexpenses',
      repo: 'dexpenses-extract',
      content: Buffer.from(content).toString('base64'),
      path: `test/data/${identifier}.txt.inactive`,
      message: `🤖 Added ${identifier} test file`,
    });
    console.log(`Added ${identifier} test file`);
    return { success: true };
  }
);
