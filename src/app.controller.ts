import { Controller, Get, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { auth } from 'twitter-api-sdk';

@Controller()
export class AppController {
  private client: auth.OAuth2User;
  constructor(private readonly appService: AppService) {
    this.client = new auth.OAuth2User({
      client_id: process.env.CLIENT_ID || 'RE1KS0VCelhQNnozWU1pQXFsOXc6MTpjaQ',
      client_secret:
        process.env.CLIENT_SECRET ||
        'zZwg7jKI18oYRCVgEJFiQqARdba6nCB2S9hT_oyhK6TFa9ts-9',
      callback: process.env.CLIENT_CALLBACK || 'http://127.0.0.1:3000/callback',
      scopes: ['tweet.read', 'users.read', 'offline.access'],
    });
  }

  @Get('/login')
  async login(@Res() res): Promise<any> {
    const authUrl = this.client.generateAuthURL({
      code_challenge_method: 's256',
      state: 'radm',
    });
    return res.redirect(authUrl);
  }

  @Get('/callback')
  async callback(@Query('code') code: string): Promise<any> {
    try {
      return await this.client.requestAccessToken(code);
    } catch (error) {
      console.error(error);
    }
  }
}
