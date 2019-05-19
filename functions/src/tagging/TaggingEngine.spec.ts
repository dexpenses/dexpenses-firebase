import TaggingEngine from './TaggingEngine';
import DateCondition from '@dexpenses/rule-conditions/lib/condition/DateCondition';
import { DateTime } from 'luxon';

describe('TaggingEngine', () => {
  it('should not fail if place type not found', () => {
    const engine = new TaggingEngine([]);
    expect(
      engine.tag({
        place: {
          types: ['non_existing_place_type'],
        } as any,
      })
    ).toEqual([]);
  });

  it('should infer tags from single place type', () => {
    const engine = new TaggingEngine([]);
    expect(
      engine.tag({
        place: {
          types: ['supermarket'],
        } as any,
      })
    ).toEqual(['food']);
  });

  it('should infer tags from two place types', () => {
    const engine = new TaggingEngine([]);
    expect(
      engine.tag({
        place: {
          types: ['supermarket', 'movie_theater'],
        } as any,
      })
    ).toEqual(['food', 'entertainment']);
  });

  it('should tag DateCondition on weekday', () => {
    const engine = new TaggingEngine([
      {
        condition: new DateCondition('weekday', '==', 7),
        tags: ['tag'],
      },
    ]);
    expect(
      engine.tag({
        date: DateTime.fromFormat('31.03.2019', 'dd.MM.yyyy', {
          zone: 'Europe/Berlin',
        }).toJSDate(),
      })
    ).toEqual(['tag']);
  });
});
