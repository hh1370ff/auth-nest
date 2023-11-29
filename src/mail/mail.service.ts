import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import Mail, * as mail from 'nodemailer/lib/mailer';

@Injectable()
export class MailService {
  private nodeMailerTransport: Mail;
  constructor(private readonly configService: ConfigService) {
    this.nodeMailerTransport = createTransport({
      service: this.configService.get('EMAIL_SERVICE'),
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  sendEmail(options: Mail.Options) {
    return this.nodeMailerTransport.sendMail(options);
  }
}
