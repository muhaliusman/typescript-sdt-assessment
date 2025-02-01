import { DateTime } from "luxon";
import User from "../entities/user.entity";

export default interface IUserRepository {
  create(user: User): Promise<User>;
  update(id: number, user: User): Promise<User>;
  delete(id: number): Promise<void>;
  getByEmail(email: string): Promise<User | null>;
  getById(id: number): Promise<User | null>;
  getForNotifications(
    data: DateTime,
    limit: number,
    retryLimit: number,
    lastId: number
  ): Promise<User[]>;
}
