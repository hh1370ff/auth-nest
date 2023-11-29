import { Injectable } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { EmailScheduleDto } from './emil-schedule.dto';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class EmailScheduleService {
  constructor(
    private readonly mailService: MailService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  scheduleEmail(emailSchedule: EmailScheduleDto) {
    const { to, subject, content: text, date } = emailSchedule;
    const newDate = new Date(date);
    const job = new CronJob(newDate, () => {
      this.mailService.sendEmail({ to, subject, text });
    });

    this.schedulerRegistry.addCronJob(`${new Date()}-${to}-${subject}`, job);
    job.start();
  }

  cancelAllScheduledEmails() {
    this.schedulerRegistry.getCronJobs().forEach((job) => {
      job.stop();
    });
  }
}
