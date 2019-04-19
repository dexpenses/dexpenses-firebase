import * as fbTest from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import dataset from '../src/big-query-export/dataset';

const test = fbTest();

const fixedDate = new Date('2019-01-01T00:00:00.000Z');
global.Date = class extends Date {
  constructor() {
    super();
    return fixedDate;
  }
} as any;

jest.spyOn(admin, 'initializeApp');

jest.mock('../src/big-query-export/dataset', () => ({
  default: {
    table: jest.fn().mockReturnValue({
      insert: jest.fn(),
    }),
  },
}));

const receiptsToBigQuery = test.wrap(require('../src').receiptsToBigQuery);

beforeEach(() => {
  (dataset.table('').insert as any).mockClear();
  (dataset.table as any).mockClear();
});

describe('BigQueryExport (offline) - receipts', () => {
  it('should create insert', async () => {
    const refPath = 'receiptsByUser/testUserId/receipts/test-recept.jpg';
    const before = test.firestore.makeDocumentSnapshot({}, refPath);
    const after = test.firestore.makeDocumentSnapshot(
      {
        result: {
          data: {
            header: ['header'],
          },
        },
      },
      refPath
    );
    const change = test.makeChange(before, after);
    await receiptsToBigQuery(change, {
      params: {
        userId: 'testUserId',
        receiptId: 'test-receipt.jpg',
      },
    });
    expect(dataset.table).toHaveBeenCalledTimes(1);
    expect(dataset.table).toHaveBeenCalledWith('receipts');
    expect(dataset.table('receipts').insert).toMatchSnapshot();
  });
});

const recurringPaymentsToBigQuery = test.wrap(
  require('../src').recurringPaymentsToBigQuery
);

describe('BigQueryExport (offline) - recurringPayments', () => {
  it('should create insert', async () => {
    const refPath =
      'recurringPaymentsByUser/testUserId/recurringPayments/abcdef';
    const before = test.firestore.makeDocumentSnapshot({}, refPath);
    const after = test.firestore.makeDocumentSnapshot(
      {
        name: 'name',
        description: 'description',
        amount: {
          value: 10,
          currency: 'EUR',
        },
        paymentMethod: 'DEBIT',
        period: 'Monthly',
      },
      refPath
    );
    const change = test.makeChange(before, after);
    await recurringPaymentsToBigQuery(change, {
      params: {
        userId: 'testUserId',
        paymentId: 'abcdef',
      },
    });
    expect(dataset.table).toHaveBeenCalledTimes(1);
    expect(dataset.table).toHaveBeenCalledWith('recurring_payments');
    expect(dataset.table('recurring_payments').insert).toMatchSnapshot();
  });
});
