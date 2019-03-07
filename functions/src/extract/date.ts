import { Extractor } from './extractor';
import { Receipt } from './receipt';
import { loadModel, DateExtractionDef } from './date.model';
import model from './date.model.de';
import * as fecha from 'fecha';
import { DependsOn } from './DependsOn';
import { HeaderExtractor, cleanHeaders } from './header';

@DependsOn(HeaderExtractor)
export class DateExtractor extends Extractor {
  private model: DateExtractionDef[];

  constructor() {
    super('date');
    this.model = loadModel(model);
  }

  extract(text: string, lines: string[], extracted: Receipt) {
    for (const def of this.model) {
      const m = text.match(def.regex);
      if (m) {
        const fullDate = m[0];
        cleanHeaders(extracted, fullDate);
        return fecha.parse(fullDate, def.format);
      }
    }
    return null;
  }
}
