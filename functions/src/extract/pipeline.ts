import { AmountExtractor } from './extractor/amount';
import { DateExtractor } from './extractor/date';
import { HeaderExtractor } from './extractor/header';
import { PaymentMethodExtractor } from './extractor/paymentMethod';
import { PhoneNumberExtractor } from './extractor/phone';
import DateTimePostProcessor from './postprocess/DateTimePostProcessor';
import { Receipt, ReceiptResult } from './receipt';
import { TimeExtractor } from './extractor/time';
import { PlaceExtractor } from './extractor/place';
import PlacePostProcessor from './postprocess/PlacePostProcessor';
import cleanUp from './clean-up';
import HeaderCleanUpPostProcessor from './postprocess/HeaderCleanUpPostProcessor';

export const extractorPipeline = [
  new HeaderExtractor(),
  new PhoneNumberExtractor(),
  new DateExtractor(),
  new TimeExtractor(),
  new PaymentMethodExtractor(),
  new AmountExtractor(),
  new PlaceExtractor(),
];

const postProcessors = [
  new HeaderCleanUpPostProcessor(),
  new DateTimePostProcessor(),
  new PlacePostProcessor(),
];

export function isReady({ header, date, amount }: Receipt): boolean {
  return !!header && header.length > 0 && !!date && !!amount;
}

export default async function(text: string): Promise<ReceiptResult> {
  if (!text) {
    return {
      state: 'no-text',
    };
  }
  text = cleanUp(text);
  const lines = text.split('\n');
  const extracted: Receipt = {};
  let anySuccess = false;
  for (const extractor of extractorPipeline) {
    try {
      const value = await extractor.extract(text, lines, extracted);
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
