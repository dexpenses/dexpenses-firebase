import chance, { GeneratedReceipt } from './receipts-chance';
import { MongoClient } from 'mongodb';
import { LatLngLiteral } from '@google/maps';

const password = process.env.MONGO_PASSWORD;
if (!password) {
  console.error('MONGO_PASSWORD env var missing');
  process.exit(1);
}

const YEARS_BACK = 5;
const n = YEARS_BACK * 52 * 5; // an average of 5 receipts per week
console.log(`Generating ${n} rows...`);

const data = chance
  .n(chance.receipt, n, { withinLast: { years: 5 } })
  .map(toMongo);

function toGeoJson({ lat, lng }: LatLngLiteral) {
  return {
    type: 'Point',
    coordinates: [lng, lat],
  };
}

function toMongo(receipt: GeneratedReceipt) {
  return {
    _id: {
      user: 'test',
      receipt: receipt.id,
    },
    result: {
      state: 'ready',
      data: receipt.data,
    },
    tags: receipt.tags,
    transformed: {
      location: toGeoJson(receipt.data.place.geometry.location),
    },
  };
}
console.log('Connecting to MongoDB cluster');

const uri = `mongodb+srv://admin:${password}@cluster0-w7mu7.gcp.mongodb.net/test?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true } as any);
client.connect((connectErr) => {
  if (connectErr) {
    console.error(connectErr);
    return;
  }
  console.log('Inserting...');
  const collection = client.db('dexpenses').collection('receipts');
  collection.insertMany(data, (err, result) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Inserted', result.insertedCount);
    }
    client.close();
  });
});
