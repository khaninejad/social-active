export class ContentUpdatedEvent {
  name: string;
  constructor(accountName: string) {
    this.name = accountName;
  }
}
