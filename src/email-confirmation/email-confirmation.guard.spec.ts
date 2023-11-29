import { EmailConfirmationGuard } from './email-confirmation.guard';

describe('EmailConfirmationGuard', () => {
  it('should be defined', () => {
    expect(new EmailConfirmationGuard()).toBeDefined();
  });
});
