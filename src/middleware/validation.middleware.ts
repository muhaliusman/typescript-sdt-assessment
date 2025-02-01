import { Request, Response, NextFunction } from "express";
import { z, ZodError, ZodIssue } from "zod";
import { StatusCodes } from "http-status-codes";
import ApiResponse from "../utils/api-response.util";

export default class ValidationMiddleware {
  static validate<T extends z.ZodType>(schema: T) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const data = error.errors.map((issue: ZodIssue) => ({
            field: issue.path.join("."),
            message: `${issue.path.join(".")} is ${issue.message}`,
          }));

          ApiResponse.error(
            res,
            "Validation Error",
            StatusCodes.BAD_REQUEST,
            data
          );
        }
      }
    };
  }
}
