import BaseWorker from "./base.worker";
import { inject } from "inversify";
import { Job } from "bullmq";
import { DateTime } from "luxon";
import types from "../config/inversify-types.config";
import { SendEmailData } from "../queues/queue.types";
import EmailService from "../services/email.service";
import UserService from "../services/user.service";
import EmailQueue from "../queues/email.queue";

export default class SendEmailWorker extends BaseWorker<SendEmailData> {
  constructor(
    @inject(types.IEmailService) private readonly emailService: EmailService,
    @inject(UserService) private readonly userService: UserService
  ) {
    super("send-email", async (job) => this.process(job));
  }

  async process(job: Job<SendEmailData>): Promise<void> {
    const attempt = job.attemptsMade + 1;
    const jobData = job.data;
    const user = await this.userService.getById(jobData.userId);

    if (!user) {
      return job.remove();
    }

    try {
      await this.emailService.sendEmail(jobData.message, jobData.email);
      // unlock because the email was sent successfully
      await this.userService.unlockUserForNotification(user);
      await this.userService.updateNextNotificationAtToNextyear(user);
    } catch (e: unknown) {
      if (attempt >= EmailQueue.MAX_ATTEMPTS) {
        // unlock user to allow sending notifications again
        await this.userService.unlockUserForNotification(user);
        // check the next_notification_at
        // if it's less than limit days from now, update next_notification_at to next year
        const nextNotificationAt = DateTime.fromJSDate(
          user.nextNotificationAt,
          {
            zone: user.location,
          }
        );
        const now = DateTime.now();
        if (
          now.diff(nextNotificationAt, "days").days >=
          UserService.BIRTHDAY_NOTIFICATION_RETRY_LIMIT
        ) {
          await this.userService.updateNextNotificationAtToNextyear(user);
        }
      }

      throw e;
    }
  }
}
