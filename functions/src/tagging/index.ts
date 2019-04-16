import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { FieldValue } from '@google-cloud/firestore';
import { parseCondition, Receipt } from '@dexpenses/rule-conditions';
import TaggingEngine from './TaggingEngine';
import { Rule } from './rules/Rule';

export interface TaggingMessage {
  userId: string;
  receiptId: string;
}

export const tagging = functions.pubsub
  .topic('tagging')
  .onPublish(async (message) => {
    const data: TaggingMessage = message.json;
    const receipt = await admin
      .firestore()
      .collection('receiptsByUser')
      .doc(data.userId)
      .collection('receipts')
      .doc(data.receiptId)
      .get();
    if (!receipt.exists) {
      console.error('Invalid tagging request: Receipt does not exist');
      return;
    }
    const rules = await admin
      .firestore()
      .collection('rulesByUser')
      .doc(data.userId)
      .collection('rules')
      .get();
    const taggingEngine = new TaggingEngine(
      rules.docs.map((rule) => {
        const r = rule.data();
        r.condition = parseCondition(r.condition);
        return r as Rule;
      })
    );
    const tags = taggingEngine.tag(receipt.data()!.result.data as Receipt);
    if (tags.length === 0) {
      return;
    }
    return admin
      .firestore()
      .collection('receiptsByUser')
      .doc(data.userId)
      .collection('receipts')
      .doc(data.receiptId)
      .update({
        tags: FieldValue.arrayUnion(...tags),
      });
  });
