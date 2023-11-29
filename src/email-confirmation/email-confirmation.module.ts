import { Module } from '@nestjs/common';
import { EmailConfirmationService } from './email-confirmation.service';
import { MailModule } from 'src/mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { EmailConfirmationController } from './email-confirmation.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [MailModule, JwtModule, ConfigModule, UserModule],
  providers: [EmailConfirmationService],
  exports: [EmailConfirmationService],
  controllers: [EmailConfirmationController],
})
export class EmailConfirmationModule {}
