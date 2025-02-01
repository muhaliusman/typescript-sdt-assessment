import axios from "axios";
import { injectable } from "inversify";
import IEmailService from "./email.service.interface";
import { env } from "../env";

@injectable()
export default class EmailService implements IEmailService {
  async sendEmail(message: string, email: string): Promise<void> {
    // Send email to fake endpoint
    const requestBody: {
      message: string;
      email: string;
    } = {
      message,
      email,
    };
    try {
      await axios.post(env.EMAIL_ENDPOINT, requestBody);
    } catch (error: unknown) {
      console.log("Error sending email:", error);

      throw new Error("Error sending email");
    }
  }
}
