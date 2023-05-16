export interface UpdateTweetDto {
  readonly id: string;
  readonly Tweet: {
    id: string;
    text: string;
  };
}
