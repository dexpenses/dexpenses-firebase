import { Receipt } from '../../model/receipt';

export default abstract class PostProcessor {
  public abstract touch(extracted: Receipt): void;
}
