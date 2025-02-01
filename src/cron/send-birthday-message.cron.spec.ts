import User from "../entities/user.entity";
import EmailQueue from "../queues/email.queue";
import UserService from "../services/user.service";
import SendBirthdayMessageCron from "./send-birthday-message.cron";

describe("SendBirthdayMessageCron", () => {
  let userService: jest.Mocked<UserService>;
  let emailQueue: jest.Mocked<EmailQueue>;
  let cron: SendBirthdayMessageCron;

  beforeEach(() => {
    userService = {
      getUsersForBirthdayNotification: jest.fn(),
      lockUserForNotification: jest.fn(),
      unlockUserForNotification: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    emailQueue = {
      enqueue: jest.fn(),
    } as unknown as jest.Mocked<EmailQueue>;

    cron = new SendBirthdayMessageCron(userService, emailQueue);
  });

  it("should process users and enqueue emails", async () => {
    const users: User[] = [
      {
        id: 1,
        email: "test1@example.com",
        firstName: "John",
        lastName: "Doe",
      } as User,
      {
        id: 2,
        email: "test2@example.com",
        firstName: "Jane",
        lastName: "Doe",
      } as User,
    ];
    userService.getUsersForBirthdayNotification.mockResolvedValueOnce(users);

    await cron.run();

    expect(userService.getUsersForBirthdayNotification).toHaveBeenCalledTimes(
      1
    );
    expect(userService.lockUserForNotification).toHaveBeenCalledTimes(
      users.length
    );
    expect(emailQueue.enqueue).toHaveBeenCalledTimes(users.length);
    expect(emailQueue.enqueue).toHaveBeenCalledWith(
      "send-birthday-message",
      expect.objectContaining({ email: "test1@example.com" })
    );
    expect(emailQueue.enqueue).toHaveBeenCalledWith(
      "send-birthday-message",
      expect.objectContaining({ email: "test2@example.com" })
    );
  });

  it("should handle errors and unlock users when email sending fails", async () => {
    const users: User[] = [
      {
        id: 1,
        email: "test1@example.com",
        firstName: "John",
        lastName: "Doe",
      } as User,
    ];
    userService.getUsersForBirthdayNotification.mockResolvedValueOnce(users);
    userService.lockUserForNotification.mockResolvedValue();
    emailQueue.enqueue.mockRejectedValue(new Error("Queue error"));

    await cron.run();

    expect(userService.unlockUserForNotification).toHaveBeenCalledWith(
      users[0]
    );
  });
});
