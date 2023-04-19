export interface UpdateBlogDto {
  readonly id: string;
  readonly blog: {
    id: number;
    title: string;
    link: string;
    slug: string;
    date: Date;
  };
}
