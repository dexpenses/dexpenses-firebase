const Chance = require('chance');
const { DateTime } = require('luxon');
const { placeTypeMappings } = require('@dexpenses/core');
const { BigQuery } = require('@google-cloud/bigquery');

const chance = new Chance();

const YEARS_BACK = 5;

chance.mixin({
  timestampWithinLast(duration) {
    const min = DateTime.fromJSDate(new Date())
      .minus(duration)
      .toJSDate()
      .getTime();
    return new Date(chance.integer({ min, max: new Date().getTime() }));
  },
  receiptTag() {
    return chance.pickone([
      ...new Set(Object.values(placeTypeMappings).filter((t) => !!t)),
    ]);
  },
  customReceiptTag() {
    return chance.pickone([
      'custom',
      'tag',
      'melikey',
      'awesome',
      'justhadto',
      'moneyz',
      'iknow',
      'inevitable',
      'music',
      'dev',
      'hacking',
    ]);
  },
  receipt() {
    return {
      user_id: 'test',
      receipt_id: chance.guid(),
      amount: chance.floating({ min: 0, max: 200, fixed: 2 }),
      currency: 'EUR',
      payment_method: chance.pickone([
        'DEBIT',
        'CASH',
        'CREDIT',
        'PAYPAL',
        'ONLINE',
      ]),
      location: BigQuery.geography(
        `POINT(${chance
          .coordinates()
          .split(',')
          .map((s) => s.trim())
          .reverse()
          .join(' ')})`
      ),
      timestamp: chance.timestampWithinLast({ years: YEARS_BACK }),
      header: chance.n(chance.word, 3),
      tags: [
        chance.receiptTag(),
        ...chance.unique(
          chance.customReceiptTag,
          chance.pickone([0, 0, 0, 0, 0, 0, 1, 1, 2])
        ),
      ],
      bq_inserted_at: new Date(),
      bq_op: 'I',
    };
  },
});

const n = YEARS_BACK * 52 * 5; // an average of 5 receipts per week
console.log(`Generating ${n} rows...`);

const rows = chance.n(chance.receipt, n);

console.log('Inserting to BigQuery...');

async function insert() {
  const bq = new BigQuery();
  await bq
    .dataset('dexpenses_bi')
    .table('receipts')
    .insert(rows);
  console.log('Done.');
}
insert();
