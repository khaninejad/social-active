export interface UpdateAccountDto {
  readonly account: string;
  readonly config: {
    readonly reminder: string;
  };
  readonly credentials: {
    readonly client_id: string;
    readonly client_secret: string;
    readonly callback: string;
  };
  readonly twitter: {
    readonly id: string;
    readonly username: string;
    readonly name: string;
    readonly url: string;
    readonly description: string;
    readonly profile_image_url: string;
    readonly location: string;
    readonly verified: string;
    readonly created_at: string;
  };
  readonly feeds: string;
}
