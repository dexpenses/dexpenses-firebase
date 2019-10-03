import * as functions from 'firebase-functions';
import { MongoClient, Collection } from 'mongodb';

const execOn = (collectionName: string) => async (
  handler: (collection: Collection, client: MongoClient) => Promise<any>
) => {
  const client = await MongoClient.connect(functions.config().mongo.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    return handler(client.db('dexpenses').collection(collectionName), client);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
};

export default {
  receipts: execOn('receipts'),
  recurringPayments: execOn('recurringPayments'),
  collection: execOn,
};
