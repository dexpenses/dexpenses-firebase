import * as functions from 'firebase-functions';
import { BigQueryRow, fromSnapshotChange } from './row';
import dataset from './dataset';

interface BigQueryRecurringPayment extends BigQueryRow {
  payment_id: string;
  user_id: string;
  name?: string;
  description?: string;
  period?: 'Monthly' | 'Quarterly' | 'Yearly';
  c_period?: number;
  amount?: number;
  currency?: string;
  payment_method?: string;
  due?: string;
}

const numericPaymentPeriodMapping = {
  Monthly: 1,
  Quarterly: 4,
  Yearly: 12,
};

export const recurringPaymentsToBigQuery = functions.firestore
  .document('recurringPaymentsByUser/{userId}/recurringPayments/{paymentId}')
  .onWrite(async (snap, context) => {
    const userId = context.params.userId;
    const paymentId = context.params.paymentId;
    let row: BigQueryRecurringPayment = {
      ...fromSnapshotChange(snap),
      user_id: userId,
      payment_id: paymentId,
    };
    if (snap.after.exists) {
      const data = snap.after.data() as any;
      row = {
        ...row,
        name: data.name,
        description: data.description,
        amount: (data.amount || {}).value,
        currency: (data.amount || {}).currency,
        payment_method: data.paymentMethod,
        period: data.period,
        c_period: numericPaymentPeriodMapping[data.period],
      };
    }

    try {
      await dataset.table('recurring_payments').insert(row);
    } catch (e) {
      console.error(JSON.stringify(e));
      throw e;
    }
  });
