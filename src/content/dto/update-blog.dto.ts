export interface UpdateBlogDto {
  readonly id: string;
  readonly blog: {
    id: number;
    title: string;
    date: Date;
  };
}
