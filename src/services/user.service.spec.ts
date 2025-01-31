import UserService from "services/user.service";
import User from "entities/user.entity";
import NotFoundException from "exceptions/not-found.exception";
import IUserRepository from "repositories/interfaces/user-repository.interface";

describe("UserService", () => {
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

  describe("create", () => {
    it("should create a user", async () => {
      const user = { email: "test@example.com" } as User;
      userRepositoryMock.create.mockResolvedValue(user);

      const result = await userService.create(user);

      expect(userRepositoryMock.create).toHaveBeenCalledWith(user);
      expect(result).toEqual(user);
    });
  });

  describe("update", () => {
    it("should update a user if found", async () => {
      const user = { email: "updated@example.com" } as User;
      userRepositoryMock.getById.mockResolvedValue(user);
      userRepositoryMock.update.mockResolvedValue(user);

      const result = await userService.update(1, user);

      expect(userRepositoryMock.getById).toHaveBeenCalledWith(1);
      expect(userRepositoryMock.update).toHaveBeenCalledWith(1, user);
      expect(result).toEqual(user);
    });

    it("should throw NotFoundException if user ID is not found", async () => {
      userRepositoryMock.getById.mockResolvedValue(null);

      await expect(userService.update(1, {} as User)).rejects.toThrow(
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
