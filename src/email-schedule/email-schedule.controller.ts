import { Body, Controller, Post } from '@nestjs/common';
import { EmailScheduleService } from './email-schedule.service';
import { EmailScheduleDto } from './emil-schedule.dto';

@Controller('email-schedule')
export class EmailScheduleController {
  constructor(private emailScheduleService: EmailScheduleService) {
    console.log('something');
  }

  @Post('send')
  scheduleEmail(@Body() emailSchedule: EmailScheduleDto) {
    this.emailScheduleService.scheduleEmail(emailSchedule);
  }
}
