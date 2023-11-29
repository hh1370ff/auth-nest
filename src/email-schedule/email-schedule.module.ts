import { Module } from '@nestjs/common';
import { EmailScheduleService } from './email-schedule.service';
import { MailModule } from 'src/mail/mail.module';
import { EmailScheduleController } from './email-schedule.controller';

@Module({
  providers: [EmailScheduleService],

  imports: [MailModule],
  controllers: [EmailScheduleController],
})
export class EmailScheduleModule {}
