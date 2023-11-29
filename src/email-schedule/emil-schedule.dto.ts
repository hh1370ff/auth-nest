import { IsDateString, IsEmail, IsString } from 'class-validator';

export class EmailScheduleDto {
  @IsEmail()
  to: string;

  @IsString()
  subject: string;

  @IsString()
  content: string;

  @IsDateString()
  date: string;
}
