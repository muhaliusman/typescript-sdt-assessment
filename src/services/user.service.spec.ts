import { DateTime } from "luxon";
import { UserSchema } from "../schemas/user.schema";
import UserService from "./user.service";
import User from "../entities/user.entity";
import IUserRepository from "../repositories/user-repository.interface";
import NotFoundException from "../exceptions/not-found.exception";

describe("UserService", () => {
  const userSchema: UserSchema = {
    email: "test@gmail.com",
    firstName: "John",
    lastName: "Doe",
    birthday: "1990-01-02",
    location: "Asia/Jakarta",
  };

  const expectedUser = {
    email: "test@gmail.com",
    firstName: "John",
    lastName: "Doe",
    birthday: DateTime.fromFormat("1990-01-02", "yyyy-MM-dd").toJSDate(),
    location: "Asia/Jakarta",
    nextNotificationAt: DateTime.fromFormat(
      "1990-01-02 09:00:00",
      "yyyy-MM-dd HH:mm:ss"
    )
      .set({ year: DateTime.now().year })
      .setZone("Asia/Jakarta")
      .setZone("local", { keepLocalTime: true })
      .toJSDate(),
  } as User;

  let userService: UserService;
  let userRepositoryMock: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    userRepositoryMock = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getByEmail: jest.fn(),
      getById: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

    userService = new UserService(userRepositoryMock);
  });

  beforeAll(() => {
    // Mock date to make sure the test is consistent
    jest.useFakeTimers().setSystemTime(new Date("2025-01-01").getTime());
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe("create", () => {
    it("should create a user", async () => {
      userRepositoryMock.create.mockResolvedValue(expectedUser);

      const result = await userService.create(userSchema);

      expect(userRepositoryMock.create).toHaveBeenCalledWith(expectedUser);
      expect(result).toEqual(expectedUser);
    });
  });

  describe("update", () => {
    it("should update a user if found", async () => {
      userRepositoryMock.getById.mockResolvedValue(expectedUser);
      userRepositoryMock.update.mockResolvedValue(expectedUser);

      const result = await userService.update(1, userSchema);

      expect(userRepositoryMock.getById).toHaveBeenCalledWith(1);
      expect(userRepositoryMock.update).toHaveBeenCalledWith(1, expectedUser);
      expect(result).toEqual(expectedUser);
    });

    it("should throw NotFoundException if user ID is not found", async () => {
      userRepositoryMock.getById.mockResolvedValue(null);

      await expect(userService.update(1, {} as UserSchema)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("delete", () => {
    it("should delete a user if found", async () => {
      userRepositoryMock.getById.mockResolvedValue({} as User);
      userRepositoryMock.delete.mockResolvedValue();

      await userService.delete(1);

      expect(userRepositoryMock.getById).toHaveBeenCalledWith(1);
      expect(userRepositoryMock.delete).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundException if user ID is not found", async () => {
      userRepositoryMock.getById.mockResolvedValue(null);

      await expect(userService.delete(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe("getByEmail", () => {
    it("should return a user by email", async () => {
      const user = { email: "test@example.com" } as User;

      userRepositoryMock.getByEmail.mockResolvedValue(user);

      const result = await userService.getByEmail("test@example.com");

      expect(userRepositoryMock.getByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
      expect(result).toEqual(user);
    });
  });
});
