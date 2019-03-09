import { Receipt } from '../receipt';

export default abstract class PostProcessor {
  abstract touch(extracted: Receipt, metadata: { [key: string]: any }): void;
}
