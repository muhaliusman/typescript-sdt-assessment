import { Container } from "inversify";
import { DataSource } from "typeorm";
import { AppDataSource } from "./typeorm.config";
import UserService from "services/user.service";
import UserRepository from "repositories/user.repository";
import IUserRepository from "repositories/interfaces/user-repository.interface";
import types from "./inversify-types.config";
import UserController from "controllers/user.controller";

const container = new Container();
container.bind<UserService>(UserService).toSelf();
container.bind<UserController>(UserController).toSelf();
container.bind<DataSource>(DataSource).toConstantValue(AppDataSource);
container.bind<IUserRepository>(types.IUserRepository).to(UserRepository);

export default container;
