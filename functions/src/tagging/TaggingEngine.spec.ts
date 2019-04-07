import TaggingEngine from './TaggingEngine';

describe('TaggingEngine', () => {
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
});
