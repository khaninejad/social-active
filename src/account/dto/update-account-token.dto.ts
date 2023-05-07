export interface UpdateAccountTokenDto {
  readonly account: string;
  readonly token: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    scope: string;
    token_type: string;
  };
}
