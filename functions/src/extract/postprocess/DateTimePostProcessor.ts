import { DateTime } from 'luxon';
import { Receipt } from '../receipt';
import PostProcessor from './PostProcessor';

export default class DateTimePostProcessor extends PostProcessor {
  public touch(extracted: Receipt) {
    if (extracted.date) {
      let timestamp = DateTime.fromJSDate(extracted.date).setZone(
        'Europe/Berlin'
      );
      if (extracted.time) {
        const { hour, minute, second } = extracted.time;
        timestamp = timestamp.set({
          hour,
          minute,
          second,
        });
      }
      extracted.timestamp = timestamp.toJSDate();
    }
  }
}
