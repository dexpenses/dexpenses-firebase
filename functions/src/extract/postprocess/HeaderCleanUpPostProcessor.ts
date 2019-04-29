import { Receipt } from '../receipt';
import PostProcessor from './PostProcessor';

export default class HeaderCleanUpPostProcessor extends PostProcessor {
  public touch(extracted: Receipt) {
    if (!extracted.header) {
      return;
    }
    const i = extracted.header.findIndex(containsMostlyNumbers);
    if (i !== -1) {
      extracted.header.splice(i);
    }
  }
}

export function containsMostlyNumbers(line: string) {
  line = line.replace(/\s/g, '');
  const digits = [...line].filter((c) => !isNaN(+c)).length;
  return digits >= 6 && digits / line.length > 0.6;
}
