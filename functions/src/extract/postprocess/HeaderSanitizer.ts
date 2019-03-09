import PostProcessor from './PostProcessor';
import { Receipt } from '../receipt';

export default class HeaderSanitizer extends PostProcessor {
  touch(extracted: Receipt, metadata: { [key: string]: any }) {
    if (extracted.header && !Number.isNaN(metadata.relevantHeaderLines)) {
      extracted.header = extracted.header.slice(
        0,
        metadata.relevantHeaderLines
      );
    }
  }
}
