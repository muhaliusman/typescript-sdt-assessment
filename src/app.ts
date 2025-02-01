import express, { Application } from "express";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import cron from "node-cron";
import { AppDataSource } from "./config/typeorm.config";
import { env } from "./env";
import swaggerDocument from "./docs/swagger.json";
import ErrorHandler from "./utils/error-handler.util";
import userRoute from "./routes/user.route";
import container from "./config/inversify.config";
import SendBirthdayMessageCron from "./cron/send-birthday-message.cron";

export class App {
  private readonly app: Application;
  private readonly port: number;
  private crons: cron.ScheduledTask[];
  private dataSource: typeof AppDataSource;

  constructor() {
    this.app = express();
    this.port = env.APP_PORT;
  }

  public async init(withCron: boolean = true) {
    this.initPlugins();
    await this.initDB();
    this.initSwagger();
    this.initRoutes();

    if (withCron) this.initCronJobs();

    this.initErrorHandler();
  }

  private initSwagger() {
    this.app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument)
    );
  }

  private initPlugins() {
    this.app.use(bodyParser.json());
  }

  private initErrorHandler() {
    this.app.use(ErrorHandler.handle);
  }

  private async initDB() {
    this.dataSource = await AppDataSource.initialize();
  }

  private initRoutes() {
    this.app.use("/api/users", userRoute);
  }

  private initCronJobs() {
    const birthdayCron = container.get<SendBirthdayMessageCron>(
      SendBirthdayMessageCron
    );
    this.crons = [
      cron.schedule("0 * * * *", async () => {
        await birthdayCron.run();
      }),
    ];
  }

  public listen() {
    return this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }

  public closeCrons() {
    this.crons.forEach(async (cron) => {
      cron.stop();
    });
  }

  public getApp() {
    return this.app;
  }

  public getDataSource() {
    return this.dataSource;
  }
}
