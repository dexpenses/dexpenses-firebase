import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import extractorPipeline, { Config } from '@dexpenses/extract';
import { PubSub } from '@google-cloud/pubsub';
import { TextDetectionResultMessage } from '../detect-text';
import { TaggingMessage } from '../tagging';

export const extractReceipt = functions.pubsub
  .topic('extraction')
  .onPublish(async (message) => {
    const data: TextDetectionResultMessage = message.json;
    if (!data.text || !data.userId || !data.fileName) {
      console.error('Got invalid message:', data);
      return;
    }
    const userData = await admin
      .firestore()
      .collection('users')
      .doc(data.userId)
      .get();

    const receiptId = data.fileName;
    const result = await extractorPipeline(functions.config() as Config)(userData.data() || {})(data.text);
    await admin
      .firestore()
      .collection('receiptsByUser')
      .doc(data.userId)
      .collection('receipts')
      .doc(receiptId)
      .set(
        {
          result,
        },
        {
          merge: true,
        }
      );
    // TODO: only if extraction was successful
    return new PubSub().topic('tagging').publish(
      Buffer.from(
        JSON.stringify({
          userId: data.userId,
          receiptId,
          result,
        } as TaggingMessage)
      )
    );
  });
