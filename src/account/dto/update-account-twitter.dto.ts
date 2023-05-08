export interface UpdateAccountTwitterDto {
  readonly account: string;
  readonly twitter: {
    id: string;
    name: string;
    url: string;
    description: string;
    profile_image_url: string;
    username: string;
    created_at: string;
    location: string;
    verified: string;
  };
}
