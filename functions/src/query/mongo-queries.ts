import * as functions from 'firebase-functions';
import { MongoClient, Collection } from 'mongodb';
import { QueryContract } from './QueryContract';
import { DateTime } from 'luxon';
import TimeSpanParams from './params/TimeSpanParams';

// tslint:disable-next-line: max-union-size
function parseDate(date: string | Date | undefined | null, defaultValue: Date) {
  if (!date) {
    return defaultValue;
  }
  if (typeof date === 'string') {
    return DateTime.fromSQL(date).toJSDate();
  }
  return date;
}

function $match(params: TimeSpanParams) {
  return {
    $match: {
      $or: [{ '_id.user': 'test' }, { '_id.user': params.userId }],
      timestamp: {
        $gte: parseDate(params.start, new Date(0)),
        $lte: parseDate(params.end, new Date()),
      },
    },
  };
}

async function exec(handler: (collection: Collection) => Promise<any>) {
  const client = await MongoClient.connect(functions.config().mongo.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    return handler(client.db('dexpenses').collection('receipts'));
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

async function aggregate(
  pipeline: any[],
  resultTransformer?: (result: any) => any
) {
  return exec(async (collection) => {
    const result = await collection.aggregate(pipeline).toArray();

    if (result.length > 0 && resultTransformer) {
      return resultTransformer(result);
    }
    return result;
  });
}

async function query(q: any) {
  return exec((collection) =>
    collection
      .find(q)
      .limit(50)
      .toArray()
  );
}

const timeUnits = ['hour', 'day', 'month', 'year'];

/* tslint:disable:no-duplicate-string */
const mongoQueries: QueryContract = {
  async aggregateTotal(params) {
    return aggregate(
      [
        $match(params),
        {
          $group: {
            _id: null,
            value: {
              $sum: '$amount.value',
            },
          },
        },
      ],
      ([{ value }]) => ({ value })
    );
  },
  async aggregateAverageTotal(params) {
    const pipeline = [
      $match(params),
      {
        $group: {
          _id: {
            year: {
              $year: '$timestamp',
            },
            month: {
              $month: '$timestamp',
            },
          },
          total: {
            $sum: '$amount.value',
          },
        },
      },
      {
        $group: {
          _id: null,
          value: {
            $avg: '$total',
          },
        },
      },
    ];
    return aggregate(pipeline, ([{ value }]) => ({ value }));
  },
  async aggregateTotalOverTimePeriod(params) {
    const units = timeUnits.slice(timeUnits.indexOf(params.period)).reverse();
    const pipeline = [
      $match(params),
      {
        $group: {
          _id: Object.fromEntries(
            units.map((unit) => [unit, { [`$${unit}`]: '$timestamp' }])
          ),
          total: {
            $sum: '$amount.value',
          },
        },
      },
      {
        $sort: {
          ...Object.fromEntries(units.map((unit) => [`_id.${unit}`, 1])),
        },
      },
    ];
    console.log(JSON.stringify(pipeline));

    return aggregate(pipeline, (results) =>
      results.map(({ _id, total }) => [
        /* maybe transform to date */ _id,
        total,
      ])
    );
  },
  async findByBoundingBox(params) {
    /*
     * {
        <location field>: {
          $geoWithin: {
              $box: [
                [ <bottom left coordinates> ],
                [ <upper right coordinates> ]
              ]
          }
        }
      }

      Note: If you use longitude and latitude, specify longitude first.
      E.g. [[-178.2, 6.6], [-49.0, 83.3]]
     */
    const q = {
      $or: [{ '_id.user': 'test' }, { '_id.user': params.userId }],
      location: {
        $geoWithin: {
          $box: [
            [params.southWest.lng, params.southWest.lat],
            [params.northEast.lng, params.northEast.lat],
          ],
        },
      },
    };
    return query(q);
  },
  async groupByPaymentMethod(params) {
    const pipeline = [
      $match(params),
      {
        $group: {
          _id: '$paymentMethod',
          value: {
            $sum: '$amount.value',
          },
        },
      },
      {
        $project: {
          _id: 0,
          key: '$_id',
          value: 1,
        },
      },
    ];
    return aggregate(pipeline);
  },
  async groupByTags(params) {
    const pipeline = [
      $match(params),
      {
        $unwind: '$tags',
      },
      {
        $group: {
          _id: '$tags',
          value: {
            $sum: '$amount.value',
          },
        },
      },
      {
        $project: {
          _id: 0,
          key: '$_id',
          value: 1,
        },
      },
    ];
    return aggregate(pipeline);
  },
};
export default mongoQueries;
