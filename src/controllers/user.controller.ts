import { Request, Response } from "express";
import { inject } from "inversify";
import { HttpStatusCode } from "axios";
import UserService from "../services/user.service";
import { UserSchema } from "../schemas/user.schema";
import ApiResponse from "../utils/api-response.util";

export default class UserController {
  constructor(@inject(UserService) private readonly userService: UserService) {}

  async create(req: Request, res: Response): Promise<void> {
    const user: UserSchema = req.body;
    // check if user already exists
    const existingUser = await this.userService.getByEmail(user.email);
    if (existingUser) {
      ApiResponse.error(res, "Email already in use", HttpStatusCode.Conflict);
      return;
    }

    const createdUser = await this.userService.create(user);

    ApiResponse.created(res, createdUser, "User created");
  }

  async update(req: Request, res: Response): Promise<void> {
    const user: UserSchema = req.body;

    // check email
    const existingUser = await this.userService.getByEmail(user.email);
    if (existingUser && existingUser.id !== parseInt(req.params.id)) {
      ApiResponse.error(res, "Email already in use", HttpStatusCode.Conflict);
      return;
    }

    const updatedUser = await this.userService.update(
      parseInt(req.params.id),
      user
    );

    ApiResponse.success(res, updatedUser, "User updated");
  }

  async delete(req: Request, res: Response): Promise<void> {
    await this.userService.delete(parseInt(req.params.id));

    ApiResponse.success(res, { id: req.params.id }, "User deleted");
  }
}
