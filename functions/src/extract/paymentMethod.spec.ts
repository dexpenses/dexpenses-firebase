import { expect } from 'chai';
import 'mocha';
import { PaymentMethodExtractor } from './paymentMethod';

describe('Payment method extractor', () => {
  const extractor = new PaymentMethodExtractor();

  it('should be successfully extract the payment method', () => {
    const text = `girocard`;
    const paymentMethod = extractor.extract(text, text.split('\n'), {});
    expect(paymentMethod).not.to.be.undefined;
    if (paymentMethod) {
      expect(paymentMethod).to.equal('DEBIT')
    }
  });

});
