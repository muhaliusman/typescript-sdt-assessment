import BaseException from "./base.exception";

export default class NotFoundException extends BaseException {
  constructor(message: string) {
    super(message, 404);
  }
}
