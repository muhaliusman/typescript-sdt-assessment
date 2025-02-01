import { injectable } from "inversify";
import BaseQueue from "./base.queue";
import { SendEmailData } from "./queue.types";

@injectable()
export default class EmailQueue extends BaseQueue<SendEmailData> {
  public static readonly MAX_ATTEMPTS = 3;

  constructor() {
    super("send-email", EmailQueue.MAX_ATTEMPTS);
  }
}
