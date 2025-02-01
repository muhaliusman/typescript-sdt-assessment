import axios from "axios";
import EmailService from "./email.service";
import { env } from "../env";

jest.mock("axios");

describe("EmailService", () => {
  let emailService: EmailService;

  beforeEach(() => {
    emailService = new EmailService();
    jest.clearAllMocks();
  });

  it("should send an email successfully", async () => {
    const mockEmail = "test@example.com";
    const mockMessage = "Hello, this is a test email.";

    (axios.post as jest.Mock).mockResolvedValue({ status: 200 });

    await expect(
      emailService.sendEmail(mockMessage, mockEmail)
    ).resolves.toBeUndefined();

    expect(axios.post).toHaveBeenCalledWith(env.EMAIL_ENDPOINT, {
      message: mockMessage,
      email: mockEmail,
    });

    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when email sending fails", async () => {
    const mockEmail = "error@example.com";
    const mockMessage = "This email will fail.";

    (axios.post as jest.Mock).mockRejectedValue(new Error("Request failed"));

    await expect(
      emailService.sendEmail(mockMessage, mockEmail)
    ).rejects.toThrow("Error sending email");

    expect(axios.post).toHaveBeenCalledWith(env.EMAIL_ENDPOINT, {
      message: mockMessage,
      email: mockEmail,
    });

    expect(axios.post).toHaveBeenCalledTimes(1);
  });
});
