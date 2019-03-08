import PostProcessor from './PostProcessor';
import { Receipt } from '../receipt';
import { DateTime } from 'luxon';

export default class DateTimePostProcessor extends PostProcessor {
  touch(extracted: Receipt) {
    if (extracted.date && extracted.time) {
      const { hour, minute, second } = extracted.time;
      extracted.timestamp = DateTime.fromJSDate(extracted.date)
        .setZone('Europe/Berlin')
        .set({
          hour,
          minute,
          second,
        })
        .toJSDate();
    }
  }
}
