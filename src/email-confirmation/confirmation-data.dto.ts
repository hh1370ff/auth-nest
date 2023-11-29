import { IsString } from 'class-validator';

export class ConfirmationDataDto {
  @IsString()
  token: string;
}
