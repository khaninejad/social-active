import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ContentUpdatedEvent } from "../../events/content-updated.event";

@Injectable()
export class ContentUpdatedListener {
  @OnEvent("content.updated")
  handleContentUpdatedEvent(event: ContentUpdatedEvent) {
    Logger.debug(`Listener started ${event}`);
  }
}
