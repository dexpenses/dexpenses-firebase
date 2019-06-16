const algoliasearch = require('algoliasearch');
const admin = require('firebase-admin');

admin.initializeApp();

if (!process.env.ALGOLIA_APIKEY) {
  console.error('ALGOLIA_APIKEY env var missing');
  process.exit(1);
}
const apiKey = process.env.ALGOLIA_APIKEY;
const appId = 'ETJ1H7S5IO';
const indexName = 'dev_receipts';

async function getData() {
  const users = await admin
    .firestore()
    .collection('receiptsByUser')
    .listDocuments();

  const docs = [];
  for (const user of users) {
    const receipts = await user.collection('receipts').get();
    for (const receiptRef of receipts.docs) {
      const receipt = receiptRef.data();
      const data = receipt.result && receipt.result.data;
      if (data && data.timestamp) {
        data.timestamp_seconds = data.timestamp.seconds;
        data.timestamp = data.timestamp.toDate();
      }
      if (data && data.date) {
        data.date_seconds = data.date.seconds;
        data.date = data.date.toDate();
      }
      docs.push({
        ...receipt,
        objectID: `${user.id}_${receiptRef.id}`,
        receiptId: receiptRef.id,
        owner: user.id,
      });
    }
  }
  return docs;
}

const client = algoliasearch(appId, apiKey);
const index = client.initIndex(indexName);

getData().then((docs) => {
  index.saveObjects(docs, (err, res) => {
    if (err) {
      console.error(err);
    } else {
      console.log(res);
    }
  });
});
