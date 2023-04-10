import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Go here to login: http://127.0.0.1:3000/login';
  }
}
