import { DateTime } from "luxon";
import { DateExtractionDef, loadModel } from "./date.model";
import model from "./date.model.de";
import { DependsOn } from "./DependsOn";
import { Extractor } from "./extractor";
import { cleanHeaders, HeaderExtractor } from "./header";
import { Receipt } from "./receipt";

@DependsOn(HeaderExtractor)
export class DateExtractor extends Extractor {
  private model: DateExtractionDef[];

  constructor() {
    super("date");
    this.model = loadModel(model);
  }

  public extract(text: string, lines: string[], extracted: Receipt) {
    for (const def of this.model) {
      const m = text.match(def.regex);
      if (m) {
        const fullDate = m[0].replace(/\s*/g, "");
        cleanHeaders(extracted, fullDate);
        return DateTime.fromFormat(fullDate, def.format, {
          zone: "Europe/Berlin",
        }).toJSDate();
      }
    }
    return null;
  }
}
