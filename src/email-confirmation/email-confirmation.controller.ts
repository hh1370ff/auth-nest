import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ConfirmationDataDto } from './confirmation-data.dto';
import { EmailConfirmationService } from './email-confirmation.service';

@Controller('email-confirmation')
export class EmailConfirmationController {
  constructor(
    private readonly emailConfirmationService: EmailConfirmationService,
  ) {}

  @Post('confirm')
  async confirmEmail(@Body() confirmationData: ConfirmationDataDto) {
    const { token } = confirmationData;
    const email = this.emailConfirmationService.decodeToken(token);
    await this.emailConfirmationService.confirmEmail(email);
  }
}
