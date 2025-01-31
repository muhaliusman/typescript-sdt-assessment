import BaseException from "exceptions/base.exception";
import { Request, Response, NextFunction } from "express";

export default class ErrorHandler {
  static handle(error: Error, req: Request, res: Response, next: NextFunction) {
    if (res.headersSent) {
      return next(error);
    }

    if (error instanceof BaseException) {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: error.message });
  }
}
