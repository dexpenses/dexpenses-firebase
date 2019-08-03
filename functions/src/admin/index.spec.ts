import { buildIdentifier } from '.';

describe('admin functions / test data / identifier builder', () => {
  it('should build the correct name without a classifier', () => {
    expect(
      buildIdentifier({
        category: 'ec',
        cityCode: 'wob',
        name: 'test',
        paymentMethod: 'CREDIT',
      })
    ).toBe('ec/wob-test-credit');
  });

  it('should build the correct name without a payment method', () => {
    expect(
      buildIdentifier({
        category: 'ec',
        cityCode: 'wob',
        name: 'test',
        classifier: 'classifier',
      })
    ).toBe('ec/wob-test-classifier');
  });

  it('should build the correct name without classifier and payment method', () => {
    expect(
      buildIdentifier({
        category: 'ec',
        cityCode: 'wob',
        name: 'test',
      })
    ).toBe('ec/wob-test');
  });

  it('should build the correct name with all info', () => {
    expect(
      buildIdentifier({
        category: 'ec',
        cityCode: 'wob',
        name: 'test',
        classifier: 'classifier',
        paymentMethod: 'CREDIT',
      })
    ).toBe('ec/wob-test-classifier-credit');
  });

  it('should trim the strings', () => {
    expect(
      buildIdentifier({
        category: 'ec',
        cityCode: ' wob ',
        name: ' test ',
        paymentMethod: ' credit ' as any,
      })
    ).toBe('ec/wob-test-credit');
  });

  it('should lower the strings', () => {
    expect(
      buildIdentifier({
        category: 'ec',
        cityCode: 'WOB',
        name: 'TEST',
        paymentMethod: 'CREDIT',
      })
    ).toBe('ec/wob-test-credit');
  });

  it('should replace whitespace with dashes', () => {
    expect(
      buildIdentifier({
        category: 'ec',
        cityCode: 'wob',
        name: ' something with spaces ',
        paymentMethod: 'CREDIT',
      })
    ).toBe('ec/wob-something-with-spaces-credit');
  });
});
