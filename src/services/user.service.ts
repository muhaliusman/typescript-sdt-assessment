import { inject, injectable } from "inversify";
import { DateTime } from "luxon";
import IUserRepository from "../repositories/user-repository.interface";
import { UserSchema } from "../schemas/user.schema";
import User from "../entities/user.entity";
import NotFoundException from "../exceptions/not-found.exception";
import types from "../config/inversify-types.config";

@injectable()
export default class UserService {
  // it means that the notification will be retried every day for 3 days
  public static readonly BIRTHDAY_NOTIFICATION_RETRY_LIMIT = 3;

  constructor(
    @inject(types.IUserRepository)
    private readonly userRepository: IUserRepository
  ) {}

  async create(user: UserSchema): Promise<User> {
    const userEntity = this.convertUserSchemaToEntity(user);

    return this.userRepository.create(userEntity);
  }

  async update(id: number, user: UserSchema): Promise<User> {
    const existingUser = await this.userRepository.getById(id);
    if (!existingUser) throw new NotFoundException("User not found");

    const userEntity = this.convertUserSchemaToEntity(user);

    return this.userRepository.update(id, userEntity);
  }

  async delete(id: number): Promise<void> {
    const existingUser = await this.userRepository.getById(id);
    if (!existingUser) throw new NotFoundException("User not found");

    return this.userRepository.delete(id);
  }

  async getByEmail(email: string): Promise<User | null> {
    return this.userRepository.getByEmail(email);
  }

  async getById(id: number): Promise<User | null> {
    return this.userRepository.getById(id);
  }

  async getUsersForBirthdayNotification(
    date: DateTime,
    limit: number = 1000,
    lastId: number = 0
  ): Promise<User[]> {
    const users = await this.userRepository.getForNotifications(
      date,
      limit,
      UserService.BIRTHDAY_NOTIFICATION_RETRY_LIMIT,
      lastId
    );

    return users;
  }

  async lockUserForNotification(user: User): Promise<void> {
    user.birthdayNotifLocked = true;

    await this.userRepository.update(user.id, user);
  }

  async unlockUserForNotification(user: User): Promise<void> {
    user.birthdayNotifLocked = false;

    await this.userRepository.update(user.id, user);
  }

  async updateNextNotificationAtToNextyear(user: User): Promise<void> {
    const nextNotifDate = DateTime.fromJSDate(user.nextNotificationAt, {
      zone: user.location,
    })
      .plus({ years: 1 })
      .setZone("local", { keepLocalTime: true });

    user.nextNotificationAt = nextNotifDate.toJSDate();

    await this.userRepository.update(user.id, user);
  }

  private convertUserSchemaToEntity(user: UserSchema): User {
    const userEntity = new User();

    userEntity.email = user.email;
    userEntity.firstName = user.firstName;
    userEntity.lastName = user.lastName;
    userEntity.location = user.location;
    userEntity.birthday = DateTime.fromFormat(
      user.birthday,
      "yyyy-MM-dd"
    ).toJSDate();
    userEntity.nextNotificationAt = this.generateNextNotificationDate(
      user.birthday,
      user.location
    ).toJSDate();

    return userEntity;
  }

  private generateNextNotificationDate(
    birthDate: string,
    timezone: string
  ): DateTime {
    const currentYear = DateTime.now().year;
    // initial notif date is this year's birthday at 9:00 AM
    let nextNotifDate = DateTime.fromFormat(birthDate, "yyyy-MM-dd").set({
      year: currentYear,
      hour: 9,
      minute: 0,
      second: 0,
    });
    // If birthday has already passed this year, schedule for next year
    // Otherwise, schedule for this year
    const diffDays = nextNotifDate.diffNow("days").days;
    if (diffDays < 0) {
      nextNotifDate = nextNotifDate.plus({ years: 1 });
    }

    return nextNotifDate
      .setZone(timezone)
      .setZone("local", { keepLocalTime: true });
  }
}
