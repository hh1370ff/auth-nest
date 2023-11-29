import { Controller, Get, Post, Render, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('login')
  root(): { message: string } {
    return { message: 'ejs content' };
  }

  @Get('redirect')
  @Render('redirect')
  redirect(): { message: string } {
    fetch('http://localhost:3000/google-authentication/authenticateWithGoogle');
    return { message: 'ejs content' };
  }
}
