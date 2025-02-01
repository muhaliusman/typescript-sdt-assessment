import { Brackets, DataSource, Repository } from "typeorm";
import { injectable } from "inversify";
import IUserRepository from "./user-repository.interface";
import { DateTime } from "luxon";
import User from "../entities/user.entity";

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

  async getForNotifications(
    date: DateTime,
    limit: number,
    retryLimit: number,
    lastId: number = 0
  ): Promise<User[]> {
    return this.repository
      .createQueryBuilder("user")
      .where(
        new Brackets((qb) => {
          qb.where(
            "DATE_FORMAT(user.next_notification_at, '%Y-%m-%d %H') = DATE_FORMAT(:date, '%Y-%m-%d %H')",
            { date: date.toJSDate() }
          ).orWhere(
            new Brackets((qb2) => {
              qb2
                .where(
                  new Brackets((qb3) => {
                    qb3
                      .where(
                        "(TIMESTAMPDIFF(DAY, user.next_notification_at, :date) ) <= :retryLimit",
                        { date: date.toJSDate(), retryLimit }
                      )
                      .andWhere("user.next_notification_at < :date", {
                        date: date.toJSDate(),
                      });
                  })
                )
                .andWhere(
                  "DATE_FORMAT(user.next_notification_at, '%H') = DATE_FORMAT(:date, '%H')",
                  { date: date.toJSDate() }
                );
            })
          );
        })
      )
      .andWhere("user.birthday_notif_locked = 0")
      .andWhere("user.id > :lastId", { lastId })
      .orderBy("user.id")
      .limit(limit)
      .getMany();
  }
}
