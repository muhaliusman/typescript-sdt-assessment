import container from "config/inversify.config";
import UserController from "controllers/user.controller";
import { Router } from "express";
import AsyncHandler from "middleware/async-handler.middleware";
import ValidationMiddleware from "middleware/validation.middleware";
import { createOrUpdateUserSchema } from "schemas/user.schema";

class UserRoute {
  private readonly userController: UserController;
  public readonly router: Router;

  constructor() {
    this.userController = container.get<UserController>(UserController);
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    this.router.post(
      "/",
      ValidationMiddleware.validate(createOrUpdateUserSchema),
      AsyncHandler.handle(this.userController.create.bind(this.userController))
    );
    this.router.put(
      "/:id",
      ValidationMiddleware.validate(createOrUpdateUserSchema),
      AsyncHandler.handle(this.userController.update.bind(this.userController))
    );
    this.router.delete(
      "/:id",
      AsyncHandler.handle(this.userController.delete.bind(this.userController))
    );
  }
}

export default new UserRoute().router;
