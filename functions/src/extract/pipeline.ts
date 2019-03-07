import { HeaderExtractor } from './header';
import { AddressExtractor } from './address';
import { DateExtractor } from './date';
import { TimeExtractor } from './time';
import { AmountExtractor } from './amount';
import { PaymentMethodExtractor } from './paymentMethod';
import { ReceiptResult, Receipt } from './receipt';
import DateTimePostProcessor from './postprocess/DateTimePostProcessor';
import { PhoneNumberExtractor } from './phone';

const extractorPipeline = [
  new HeaderExtractor(),
  new AddressExtractor(),
  new PhoneNumberExtractor(),
  new DateExtractor(),
  new TimeExtractor(),
  new AmountExtractor(),
  new PaymentMethodExtractor(),
];

// todo check dependencies of extractors or re-order pipeline (error only on circular)

const postProcessors = [new DateTimePostProcessor()];

function isReady({ header, date, amount }: Receipt): boolean {
  return header && header.length > 0 && date && amount;
}

export default function(text: string): ReceiptResult {
  if (!text) {
    return {
      state: 'no-text',
    };
  }
  const lines = text.split('\n');
  const extracted: Receipt = {};
  let anySuccess = false;
  for (const extractor of extractorPipeline) {
    try {
      const value = extractor.extract(text, lines, extracted);
      extracted[extractor.field] = value;
      if (value) {
        anySuccess = true;
      }
    } catch (e) {
      extracted[extractor.field] = {
        error: e.message || (typeof e === 'string' && e) || 'unknown',
      };
    }
  }
  if (!anySuccess) {
    return {
      state: 'unreadable',
      data: extracted, // could contains errors
    };
  }
  for (const postProcessor of postProcessors) {
    postProcessor.touch(extracted);
  }
  return {
    state: isReady(extracted) ? 'ready' : 'partial',
    data: extracted,
  };
}
