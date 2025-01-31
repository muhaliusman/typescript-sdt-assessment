import { DataSource, Repository } from "typeorm";
import User from "entities/user.entity";
import { injectable } from "inversify";
import IUserRepository from "./interfaces/user-repository.interface";

@injectable()
export default class UserRepository implements IUserRepository {
  private readonly repository: Repository<User>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(User);
  }

  async create(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async update(id: number, user: User): Promise<User> {
    await this.repository.update(id, user);
    return this.repository.findOneOrFail({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async getByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async getById(id: number): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }
}
