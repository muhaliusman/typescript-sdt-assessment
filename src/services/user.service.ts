import types from "config/inversify-types.config";
import User from "entities/user.entity";
import NotFoundException from "exceptions/not-found.exception";
import { inject, injectable } from "inversify";
import IUserRepository from "repositories/interfaces/user-repository.interface";

@injectable()
export default class UserService {
  constructor(
    @inject(types.IUserRepository)
    private readonly userRepository: IUserRepository
  ) {}

  async create(user: User): Promise<User> {
    return this.userRepository.create(user);
  }

  async update(id: number, user: User): Promise<User> {
    const existingUser = await this.userRepository.getById(id);
    if (!existingUser) throw new NotFoundException("User not found");

    return this.userRepository.update(id, user);
  }

  async delete(id: number): Promise<void> {
    const existingUser = await this.userRepository.getById(id);
    if (!existingUser) throw new NotFoundException("User not found");

    return this.userRepository.delete(id);
  }

  async getByEmail(email: string): Promise<User | null> {
    return this.userRepository.getByEmail(email);
  }
}
