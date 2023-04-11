export interface UpdateAccountConfigDto {
  readonly account: string;
  readonly config: { reminder: string };
}
