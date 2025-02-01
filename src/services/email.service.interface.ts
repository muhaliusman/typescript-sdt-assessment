export default interface IEmailService {
  sendEmail(message: string, email: string): Promise<void>;
}
