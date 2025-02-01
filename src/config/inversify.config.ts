import { Container } from "inversify";
import { DataSource } from "typeorm";
import { AppDataSource } from "./typeorm.config";
import UserService from "../services/user.service";
import UserController from "../controllers/user.controller";
import EmailQueue from "../queues/email.queue";
import SendEmailWorker from "../workers/send-email.worker";
import SendBirthdayMessageCron from "../cron/send-birthday-message.cron";
import IUserRepository from "../repositories/user-repository.interface";
import IEmailService from "../services/email.service.interface";
import types from "./inversify-types.config";
import EmailService from "../services/email.service";
import UserRepository from "../repositories/user.repository";

const container = new Container();
container.bind<UserService>(UserService).toSelf();
container.bind<UserController>(UserController).toSelf();
container.bind<EmailQueue>(EmailQueue).toSelf();
container.bind<SendEmailWorker>(SendEmailWorker).toSelf();
container.bind<SendBirthdayMessageCron>(SendBirthdayMessageCron).toSelf();
container.bind<DataSource>(DataSource).toConstantValue(AppDataSource);
container.bind<IUserRepository>(types.IUserRepository).to(UserRepository);
container.bind<IEmailService>(types.IEmailService).to(EmailService);

export default container;
