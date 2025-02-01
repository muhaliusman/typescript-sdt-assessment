import { Queue } from "bullmq";
import { env } from "../env";

export default abstract class BaseQueue<T> {
  protected readonly queue: Queue;
  protected readonly maxAttempts: number;

  constructor(queueName: string, maxAttempts: number) {
    this.maxAttempts = maxAttempts;
    this.queue = new Queue(queueName, {
      connection: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
      },
    });
  }

  public async enqueue(jobName: string, data: T): Promise<void> {
    await this.queue.add(jobName, data, {
      removeOnComplete: true,
      removeOnFail: true,
      attempts: this.maxAttempts,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    });
  }
}
