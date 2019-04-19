import { Change } from 'firebase-functions';
import { DocumentSnapshot, Timestamp } from '@google-cloud/firestore';

export interface BigQueryRow {
  bq_inserted_at: Date;
  bq_op: 'D' | 'I';
}

export function fromSnapshotChange(
  snap: Change<DocumentSnapshot>
): BigQueryRow {
  return {
    bq_inserted_at: (
      snap.after.updateTime ||
      snap.after.createTime ||
      Timestamp.now()
    ).toDate(),
    bq_op: !snap.after.exists ? 'D' : 'I',
  };
}
