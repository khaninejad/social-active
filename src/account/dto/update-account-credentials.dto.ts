export interface UpdateAccountCredentialsDto {
  readonly account: string;
  readonly credentials: {
    TWITTER_CLIENT_ID: string;
    TWITTER_CLIENT_SECRET: string;
    callback: string;
  };
}
