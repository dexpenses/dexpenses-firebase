import PostProcessor from './PostProcessor';
import { Receipt } from '../receipt';

export default class DateTimePostProcessor extends PostProcessor {
  touch(extracted: Receipt) {
    if (extracted.date && extracted.time) {
      const timestamp = new Date(extracted.date.getTime());
      const { hour, minute, second } = extracted.time;
      timestamp.setHours(hour);
      timestamp.setMinutes(minute);
      if (second) {
        timestamp.setSeconds(second);
      }
      extracted.timestamp = timestamp;
    }
  }
}
