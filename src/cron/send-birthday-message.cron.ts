import { inject } from "inversify";
import { DateTime } from "luxon";
import UserService from "../services/user.service";
import EmailQueue from "../queues/email.queue";
import { SendEmailData } from "../queues/queue.types";
import User from "../entities/user.entity";

export default class SendBirthdayMessageCron {
  constructor(
    @inject(UserService) private readonly userService: UserService,
    @inject(EmailQueue) private readonly emailQueue: EmailQueue
  ) {}

  async run(): Promise<void> {
    const limit = 1000;
    let lastId = 0;
    // batch processing to optimize query performance
    while (true) {
      const users = await this.userService.getUsersForBirthdayNotification(
        DateTime.now(),
        limit,
        lastId
      );

      lastId = users[users.length - 1].id;

      for (const user of users) {
        try {
          // lock user to avoid sending multiple notifications if the cron scales horizontally
          await this.userService.lockUserForNotification(user);
          await this.emailQueue.enqueue(
            "send-birthday-message",
            this.buildSendEmailData(user)
          );
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "Unknown error";

          console.log("Error while sending birthday message:", message);

          await this.userService.unlockUserForNotification(user);
        }
      }

      // break if there are no more users
      if (limit > users.length) break;
    }
  }

  private buildSendEmailData(user: User): SendEmailData {
    return {
      email: user.email,
      userId: user.id,
      message: `Hey ${user.firstName} ${user.lastName}, it's your birthday! 🎉`,
    };
  }
}
