import { fromSnapshotChange } from './row';
import { Timestamp } from '@google-cloud/firestore';
import * as mockDate from 'jest-date-mock';

const ONE_DAY = 24 * 60 * 60 * 1000;

describe('BigQuery row fromSnapshotChange', () => {
  it('should use updateTime if present', () => {
    mockDate.advanceTo('2019-01-01T00:00:00.000Z');
    const createTime = Timestamp.now();
    mockDate.advanceBy(ONE_DAY);
    const updateTime = Timestamp.now();
    mockDate.advanceBy(ONE_DAY);

    const row = fromSnapshotChange({
      before: {} as any,
      after: {
        exists: true,
        createTime,
        updateTime,
      } as any,
    });

    expect(row.bq_inserted_at).toEqual(updateTime.toDate());
    expect(row.bq_inserted_at).not.toEqual(createTime.toDate());
    expect(row.bq_inserted_at).not.toEqual(Timestamp.now().toDate());
  });

  it('should use createTime if updateTime is absent', () => {
    mockDate.advanceTo('2019-01-01T00:00:00.000Z');
    const createTime = Timestamp.now();
    mockDate.advanceBy(ONE_DAY);

    const row = fromSnapshotChange({
      before: {} as any,
      after: {
        exists: true,
        createTime,
      } as any,
    });

    expect(row.bq_inserted_at).toEqual(createTime.toDate());
    expect(row.bq_inserted_at).not.toEqual(Timestamp.now().toDate());
  });

  it('should use current time if both updateTime and createTime are absent', () => {
    mockDate.advanceTo('2019-01-01T00:00:00.000Z');

    const row = fromSnapshotChange({
      before: {} as any,
      after: {
        exists: true,
      } as any,
    });

    expect(row.bq_inserted_at).toEqual(Timestamp.now().toDate());
  });

  it('should set operation to `I` on update or create', () => {
    const row = fromSnapshotChange({
      before: {} as any,
      after: {
        exists: true,
      } as any,
    });

    expect(row.bq_op).toBe('I');
  });

  it('should set operation to `D` on update or create', () => {
    const row = fromSnapshotChange({
      before: {} as any,
      after: {
        exists: false,
      } as any,
    });

    expect(row.bq_op).toBe('D');
  });
});
