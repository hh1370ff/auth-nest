import { BadRequestException, GoneException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class EmailConfirmationService {
  constructor(
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  async confirmEmail(email: string) {
    const user = await this.userService.findOne(email);

    if (user.isEmailConfirmed)
      throw new BadRequestException('Email is already confirmed');

    const updatedUser = await this.userService.updateUser(user.id, {
      isEmailConfirmed: true,
    });
  }

  // receive token and extract email from the token
  decodeToken(token: string): string {
    try {
      const { email } = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      });

      return email;
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new GoneException('Email confirmation token expired');
      }
      throw new BadRequestException('Bad confirmation token');
    }
  }

  async sendVerificationLink(email: string) {
    // see user with this email exist

    const token = this.jwtService.sign(
      { email },
      {
        secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
        expiresIn: this.configService.get(
          'JWT_VERIFICATION_TOKEN_EXPIRATION_TIME',
        ),
      },
    );
    const to = email;
    const subject = 'Validation';
    const verificationUrl = `${this.configService.get(
      'EMAIL_CONFIRMATION_URL',
    )}?token=${token}`;
    const html = `
    <p>Click the following link to verify your email:</p>
    <a href="${verificationUrl}">${verificationUrl}</a>
  `;

    await this.mailService.sendEmail({ to, subject, html });
  }
}
