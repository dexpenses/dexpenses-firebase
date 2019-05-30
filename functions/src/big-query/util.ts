import * as functions from 'firebase-functions';
import * as https from '../https';
import { BigQuery } from '@google-cloud/bigquery';

type AuthenticatedCallableContext = Required<functions.https.CallableContext>;

type Params =
  | any[]
  | {
      [param: string]: any;
    };

export interface BigQueryFunction {
  /**
   * Validates user input by throwing an error if anything invalid occurs.
   *
   * Can be omitted if validation is required.
   * @param data data the function is called with
   * @param context the callable context
   * @throws {functions.https.HttpsError} if the request is invalid
   * @see Validate
   */
  validate?(data: any, context: AuthenticatedCallableContext): void;
  /**
   * Construct the query params that are passed to BigQuery.
   *
   * Can be omitted if the query does not contain any params.
   * @param data data the function is called with
   * @param context the callable context
   */
  parseParams?(data: any, context: AuthenticatedCallableContext): Params;

  /**
   * Either the constant BigQuery SQL query string or a function that constructs such query.
   * That function receives the data the function is called with and the callable context.
   */
  query:
    | string
    | ((data: any, context: AuthenticatedCallableContext) => string);

  /**
   * An optional result transformer. Transforms the rows returned by BigQuery into any custom result.
   * If no transformer is specified, the rows are returned as they come from BigQuery.
   * @param rows the rows returned by BigQuery
   * @see ResultTransformers
   */
  resultTransformer?(rows: any[]): any;
}

export const Validate = {
  required(v: any) {
    if (!v) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        `required property missing`
      );
    }
  },
};

export const ResultTransformers: { [key: string]: (rows: any[]) => any } = {
  SINGLE_VALUE: (rows) => ({ value: Object.values(rows[0])[0] }),
};

export function bigQueryCallable(def: BigQueryFunction) {
  return https.onAuthenticatedCall(async (data, context) => {
    if (def.validate) {
      def.validate(data, context);
    }
    let params: Params | undefined;
    if (def.parseParams) {
      params = def.parseParams(data, context);
    }
    const query =
      typeof def.query === 'string' ? def.query : def.query(data, context);
    const [rows] = await new BigQuery().query({ query, params });
    if (!def.resultTransformer) {
      return rows;
    }
    return def.resultTransformer(rows);
  });
}

export function parseTimePeriodParams(
  data: { start?: string; end?: string },
  context: functions.https.CallableContext
) {
  return {
    user_id: 'test',
    start: data.start || new Date(0),
    end: data.end || new Date(),
  };
}
