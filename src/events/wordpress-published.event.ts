import { ObjectId } from "mongoose";

export class WordpressPublishedEvent {
  id: ObjectId;
  constructor(id: ObjectId) {
    this.id = id;
  }
}
