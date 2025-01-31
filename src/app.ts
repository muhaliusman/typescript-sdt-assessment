import { AppDataSource } from "config/typeorm.config";
import express, { Application } from "express";
import { env } from "../env";
import userRoute from "routes/user.route";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../docs/swagger.json";
import ErrorHandler from "utils/error-handler.util";

export class App {
  private readonly app: Application;
  private readonly port: number;
  private dataSource: typeof AppDataSource;

  constructor() {
    this.app = express();
    this.port = env.APP_PORT;
  }

  public async init() {
    this.initPlugins();
    await this.initDB();
    this.initSwagger();
    this.initRoutes();
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

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }

  public getApp() {
    return this.app;
  }

  public getDataSource() {
    return this.dataSource;
  }
}
