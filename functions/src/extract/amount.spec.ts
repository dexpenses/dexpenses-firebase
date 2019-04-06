import { AmountExtractor } from './amount';

describe('Amount extractor', () => {
  const extractor = new AmountExtractor();

  it('should be successfully extract the amount', () => {
    const text = `Gesamt 11,10`;
    const result = extractor.extract(text, text.split['\n'], {});
    expect(result).toBeDefined();
    if (result) {
      expect(result.value).toBe(11.1);
    }
  });

  it('should be successfully extract the amount', () => {
    const text = `Betrag 11,10`;
    const result = extractor.extract(text, text.split('\n'), {});
    expect(result).toBeDefined();
    if (result) {
      expect(result.value).toBe(11.1);
    }
  });

  it('should be successfully extract the amount multiline', () => {
    const text = `betrag
    11,10`;
    const result = extractor.extract(text, text.split('\n'), {});
    expect(result).not.toBeNull();
    if (result) {
      expect(result.value).toBe(11.1);
    }
  });

  it('should be successfully extract the amount multiline', () => {
    const text = `gesamt
    11,10`;
    const result = extractor.extract(text, text.split('\n'), {});
    expect(result).toBeDefined();
    if (result) {
      expect(result.value).toBe(11.1);
    }
  });

  it('should be successfully extract the amount if lines contain only the decimals', () => {
    const text = `4,40
    5,90
    4,00
    4,10
    43,50
    0,00
    0,00
    61,90
    61,90`;
    const result = extractor.extract(
      text,
      text.split('\n').map((l) => l.trim()),
      {}
    );
    expect(result).toBeDefined();
    if (result) {
      expect(result.value).toBe(61.9);
    }
  });
});
