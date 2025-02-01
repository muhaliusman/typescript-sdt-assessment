import container from "./config/inversify.config";
import { AppDataSource } from "./config/typeorm.config";
import SendEmailWorker from "./workers/send-email.worker";

AppDataSource.initialize().then(() => {
  console.log("Database connected");
  container.get<SendEmailWorker>(SendEmailWorker);
});
