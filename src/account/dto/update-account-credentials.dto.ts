export interface UpdateAccountCredentialsDto {
  readonly account: string;
  readonly credentials: {
    client_id: string;
    client_secret: string;
    callback: string;
  };
}
