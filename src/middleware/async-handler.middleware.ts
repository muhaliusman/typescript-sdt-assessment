import { Request, Response, NextFunction } from "express";

export default class AsyncHandler {
  public static handle<T = void>(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res, next).catch(next);
    };
  }
}
