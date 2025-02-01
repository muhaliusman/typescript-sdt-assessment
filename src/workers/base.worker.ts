import { Worker, Job } from "bullmq";
import { env } from "../env";

export default abstract class BaseWorker<T> {
  protected worker: Worker<T>;

  constructor(
    queueName: string,
    processFunction: (job: Job<T>) => Promise<void>
  ) {
    this.worker = new Worker<T>(queueName, processFunction, {
      connection: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
      },
    });

    this.worker.on("completed", (job) => {
      console.info(`Processing ${job.id} completed`);
    });

    this.worker.on("failed", (job, err) => {
      console.error(`Failed to process job: ${err.message}`);
    });
  }
}
