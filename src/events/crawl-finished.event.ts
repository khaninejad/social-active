import { ObjectId } from "mongoose";

export class CrawlFinishedEvent {
  id: ObjectId;
  constructor(id: ObjectId) {
    this.id = id;
  }
}
