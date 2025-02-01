import { Request, Response } from "express";
import { HttpStatusCode } from "axios";
import UserController from "./user.controller";
import UserService from "../services/user.service";
import ApiResponse from "../utils/api-response.util";
import User from "../entities/user.entity";
import NotFoundException from "../exceptions/not-found.exception";

jest.mock("../utils/api-response.util.ts", () => ({
  success: jest.fn(),
  created: jest.fn(),
  error: jest.fn(),
}));

describe("UserController", () => {
  let userController: UserController;
  let userServiceMock: jest.Mocked<UserService>;
  let reqMock: jest.Mocked<Request>;
  let resMock: jest.Mocked<Response>;

  beforeEach(() => {
    userServiceMock = {
      getByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      userRepository: {},
    } as unknown as jest.Mocked<UserService>;

    userController = new UserController(userServiceMock);

    reqMock = {} as jest.Mocked<Request>;
    reqMock.body = jest.fn();
    reqMock.params = {};

    resMock = {} as jest.Mocked<Response>;
    resMock.status = jest.fn().mockReturnThis();
    resMock.json = jest.fn().mockReturnThis();

    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a user if email is not in use", async () => {
      const user = {
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
      } as User;

      reqMock.body = user;
      userServiceMock.getByEmail.mockResolvedValue(null);
      userServiceMock.create.mockResolvedValue(user);

      await userController.create(reqMock as Request, resMock as Response);

      expect(ApiResponse.created).toHaveBeenCalledWith(
        resMock,
        user,
        "User created"
      );
    });

    it("should return an error if email is already in use", async () => {
      const user = {
        email: "test@example.com",
      } as User;
      const existingUser = { ...user, id: 1 } as User;
      reqMock.body = user;
      userServiceMock.getByEmail.mockResolvedValue(existingUser);

      await userController.create(reqMock as Request, resMock as Response);

      expect(ApiResponse.error).toHaveBeenCalledWith(
        resMock,
        "Email already in use",
        HttpStatusCode.Conflict
      );
    });
  });

  describe("update", () => {
    it("should update a user if email is not in use", async () => {
      const user = {
        email: "updated@example.com",
        firstName: "Updated",
        lastName: "User",
      } as User;
      const userId = "1";

      reqMock.body = user;
      reqMock.params.id = userId;
      userServiceMock.getByEmail.mockResolvedValue(null);
      userServiceMock.update.mockResolvedValue(user);

      await userController.update(reqMock as Request, resMock as Response);

      expect(ApiResponse.success).toHaveBeenCalledWith(
        resMock,
        user,
        "User updated"
      );
    });

    it("should return an error if email is already in use by another user", async () => {
      const user = {
        email: "existing@example.com",
      } as User;
      const existingUser = { ...user, id: 1 } as User;
      reqMock.body = user;
      reqMock.params.id = "2";

      userServiceMock.getByEmail.mockResolvedValue(existingUser);

      await userController.update(reqMock as Request, resMock as Response);

      expect(ApiResponse.error).toHaveBeenCalledWith(
        resMock,
        "Email already in use",
        HttpStatusCode.Conflict
      );
    });

    it("should throw NotFoundException if user id is not found", async () => {
      reqMock.body = {} as User;
      reqMock.params.id = "1";
      userServiceMock.update.mockRejectedValue(
        new NotFoundException("User not found")
      );

      await expect(
        userController.update(reqMock as Request, resMock as Response)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("delete", () => {
    it("should delete a user successfully", async () => {
      reqMock.params.id = "1";
      userServiceMock.delete.mockResolvedValue();

      await userController.delete(reqMock as Request, resMock as Response);

      expect(ApiResponse.success).toHaveBeenCalledWith(
        resMock,
        { id: "1" },
        "User deleted"
      );
    });
  });
});
