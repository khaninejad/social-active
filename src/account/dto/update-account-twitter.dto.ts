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
    verified: boolean;
    public_metrics: {
      followers_count: number;
      following_count: number;
      tweet_count: number;
      listed_count: number;
    };
  };
}
