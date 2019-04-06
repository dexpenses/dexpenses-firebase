import {
  tokenize,
  replace,
  matchers,
  DOT_MATCHER,
  DASH_MATCHER,
} from './date.model';

describe('The date extractor model', () => {
  it('should successfully tokenize "dd.MM.yyyy"', () => {
    expect(tokenize('dd.MM.yyyy')).toEqual(['dd', '.', 'MM', '.', 'yyyy']);
  });

  it('should successfully tokenize "dd-MM-yyyy"', () => {
    expect(tokenize('dd-MM-yyyy')).toEqual(['dd', '-', 'MM', '-', 'yyyy']);
  });

  it('should successfully tokenize "dd-MM-yy"', () => {
    expect(tokenize('dd-MM-yy')).toEqual(['dd', '-', 'MM', '-', 'yy']);
  });

  it('should successfully tokenize "d-M-yy"', () => {
    expect(tokenize('d-M-yy')).toEqual(['d', '-', 'M', '-', 'yy']);
  });
});

describe('The date extractor regex builder', () => {
  it('should correctly create regex for format "dd.MM.yyyy"', () => {
    expect(replace('dd.MM.yyyy')).toBe(
      `${matchers.dd.source}${DOT_MATCHER}${matchers.MM.source}${DOT_MATCHER}${
        matchers.yyyy.source
      }`
    );
  });

  it('should correctly create regex for format "dd.MM.yy"', () => {
    expect(replace('dd.MM.yy')).toBe(
      `${matchers.dd.source}${DOT_MATCHER}${matchers.MM.source}${DOT_MATCHER}${
        matchers.yy.source
      }`
    );
  });

  it('should correctly create regex for format "dd-MM-yyyy"', () => {
    expect(replace('dd-MM-yyyy')).toBe(
      `${matchers.dd.source}${DASH_MATCHER}${
        matchers.MM.source
      }${DASH_MATCHER}${matchers.yyyy.source}`
    );
  });

  it('should correctly create regex for format "d-M-yyyy"', () => {
    expect(replace('d-M-yyyy')).toBe(
      `${matchers.d.source}${DASH_MATCHER}${matchers.M.source}${DASH_MATCHER}${
        matchers.yyyy.source
      }`
    );
  });
});
