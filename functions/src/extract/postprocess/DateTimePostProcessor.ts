import { DateTime } from "luxon";
import { Receipt } from "../receipt";
import PostProcessor from "./PostProcessor";

export default class DateTimePostProcessor extends PostProcessor {
  public touch(extracted: Receipt) {
    if (extracted.date && extracted.time) {
      const { hour, minute, second } = extracted.time;
      extracted.timestamp = DateTime.fromJSDate(extracted.date)
        .setZone("Europe/Berlin")
        .set({
          hour,
          minute,
          second,
        })
        .toJSDate();
    }
  }
}
