import { Receipt } from "../receipt";

export default abstract class PostProcessor {

  abstract touch(extracted: Receipt): void;

}
