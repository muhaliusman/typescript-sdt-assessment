import { Response } from "express";

export default class ApiResponse {
  static send<T>(
    res: Response,
    statusCode: number,
    message: string,
    data?: T
  ): void {
    const response: { message: string; data?: T } = {
      message,
    };

    if (data !== undefined) {
      response.data = data;
    }

    res.status(statusCode).json(response);
  }

  static success<T>(res: Response, data?: T, message?: string): void {
    ApiResponse.send(res, 200, message || "Success", data);
  }

  static created<T>(res: Response, data?: T, message?: string): void {
    ApiResponse.send(res, 201, message || "Created", data);
  }

  static error<T>(
    res: Response,
    message: string = "Internal Server Error",
    statusCode: number = 500,
    data?: T
  ): void {
    ApiResponse.send(res, statusCode, message, data);
  }
}
