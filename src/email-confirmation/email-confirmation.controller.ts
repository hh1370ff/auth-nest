import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ConfirmationDataDto } from './confirmation-data.dto';
import { EmailConfirmationService } from './email-confirmation.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('email-confirmation')
@Controller('email-confirmation')
export class EmailConfirmationController {
  constructor(
    private readonly emailConfirmationService: EmailConfirmationService,
  ) {}

  @ApiOperation({
    summary: 'confirm your email',
    description: "this route can be used to validate the user's email",
  })
  @ApiResponse({ status: 201, description: 'Email is confirmed' })
  @ApiResponse({ status: 410, description: 'Email confirmation token expired' })
  @ApiResponse({ status: 400, description: 'Bad confirmation toke' })
  @Post()
  async confirmEmail(@Body() confirmationData: ConfirmationDataDto) {
    const { token } = confirmationData;
    const email = this.emailConfirmationService.decodeToken(token);
    await this.emailConfirmationService.confirmEmail(email);
  }
}
