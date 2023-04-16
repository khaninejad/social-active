import { ObjectId } from "mongoose";

export class GenerationFinishedEvent {
  id: ObjectId;
  constructor(id: ObjectId) {
    this.id = id;
  }
}
