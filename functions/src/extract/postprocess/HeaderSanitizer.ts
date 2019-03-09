import { Receipt } from "../receipt";
import PostProcessor from "./PostProcessor";

export default class HeaderSanitizer extends PostProcessor {
  public touch(extracted: Receipt, metadata: { [key: string]: any }) {
    if (extracted.header && !Number.isNaN(metadata.relevantHeaderLines)) {
      extracted.header = extracted.header.slice(
        0,
        metadata.relevantHeaderLines
      );
    }
  }
}
