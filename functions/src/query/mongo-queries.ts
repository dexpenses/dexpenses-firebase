import * as functions from 'firebase-functions';
import { MongoClient, Collection } from 'mongodb';
import {
  QueryContract,
  createFunctions,
  TimeSpanParams,
} from './QueryContract';

function $match(params: TimeSpanParams) {
  return {
    $match: {
      // '_id.user': params.userId,
      '_id.user': 'test',
      timestamp: {
        $gte: params.start || new Date(0),
        $lte: params.end || new Date(),
      },
    },
  };
}
const uri = functions.config().mongo.uri;

async function exec(handler: (collection: Collection) => Promise<any>) {
  const client = await MongoClient.connect(uri, {
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

    if (result && resultTransformer) {
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
            total: {
              $sum: '$amount.value',
            },
          },
        },
      ],
      ([{ total }]) => total
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
          avgTotal: {
            $avg: '$total',
          },
        },
      },
    ];
    return aggregate(pipeline, ([{ avgTotal }]) => avgTotal);
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
      location: {
        $geoWithin: {
          $box: [
            [params.southWest.lng, params.southWest.lat],
            [params.northEach.lng, params.northEach.lat],
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
          total: {
            $sum: '$amount.value',
          },
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
          total: {
            $sum: '$amount.value',
          },
        },
      },
    ];
    return aggregate(pipeline);
  },
};

module.exports = createFunctions('mongo_', mongoQueries);
export const dummy = {};

// export const mongo_aggregateTotal = functions.https.onCall(
//   mongoQueries.aggregateTotal
// );
