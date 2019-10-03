import { Collection, MongoClient } from 'mongodb';

const mockClient = new (class {})() as any;
const mockCollection = {
  deleteOne: jest.fn(),
  updateOne: jest.fn(),
};
const mockDb = {
  collection: jest.fn().mockReturnValue(mockCollection),
};

const execOn = (collectionName: string) => async (
  handler: (collection: Collection, client: MongoClient) => Promise<any>
) => {
  return handler(mockDb.collection(collectionName), mockClient);
};

export default {
  receipts: execOn('receipts'),
  recurringPayments: execOn('recurringPayments'),
  collection: execOn,
  __mockDb__: mockDb,
  __mockCollection__: mockCollection,
};
