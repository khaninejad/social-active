export interface UpdateGeneratedDto {
  readonly id: string;
  readonly generated: {
    title: string;
    body: string;
    category: string;
    tags: string;
  };
}
