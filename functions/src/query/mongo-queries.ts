import * as functions from 'firebase-functions';
import { MongoClient } from 'mongodb';
import {
  QueryContract,
  createFunctions,
  TimeSpanParams,
} from './QueryContract';

function $match(params: TimeSpanParams) {
  return {
    $match: {
      '_id.user': params.userId,
      timestamp: {
        $gte: params.start || new Date(0),
        $lte: params.end || new Date(),
      },
    },
  };
}
const password = process.env.MONGO_PASSWORD;
if (!password) {
  console.error('MONGO_PASSWORD env var missing');
  process.exit(1);
}
const uri = `mongodb+srv://admin:${password}@cluster0-w7mu7.gcp.mongodb.net/test?retryWrites=true&w=majority`;
// const uri = functions.config().mongo.uri;
// const client = new MongoClient(uri, { useNewUrlParser: true });

const mongoQueries: QueryContract = {
  async aggregateTotal(params) {
    const client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    try {
      const { total } = await client
        .db('dexpenses')
        .collection('receipts')
        .aggregate([
          $match(params),
          {
            $group: {
              _id: null,
              total: {
                $sum: '$amount.value',
              },
            },
          },
        ])
        .next();
      return total;
    } finally {
      console.log('trying to close');
      client.close();
    }
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
    return 12;
  },
  async aggregateTotalOverTimePeriod(params) {
    // for unit month
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
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ];
    return [[new Date(), 13]];
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
     */
    const query = {
      location: { $geoWithin: { $box: [[-178.2, 6.6], [-49.0, 83.3]] } },
    };
    return [];
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
    return [];
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
    return [];
  },
};

mongoQueries
  .aggregateTotal({
    start: new Date('2018-01-01'),
    userId: 'test',
  })
  .then(console.log)
  .catch(console.error);

module.exports = createFunctions('mongo_', mongoQueries);
