export interface CreateAccountDto {
  readonly account: string;
  readonly access_token: string;
  readonly refresh_token: string;
  readonly expires_at: number;
  readonly scope: string;
  readonly token_type: string;
}
