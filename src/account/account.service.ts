import { Injectable } from "@nestjs/common";

@Injectable()
export class AccountService {
  getLoginUrl(): string {
    return `Follow the link for login ${process.env.LOGIN_URL}`;
  }
}
