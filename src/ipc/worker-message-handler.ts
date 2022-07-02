import { IPCMessage, IPCMessageType } from "./../types/message";
import { inject, singleton } from "tsyringe";
import { SimpleLogger } from "../logging/logger-impl";
import { ServerContext } from "../types/context";

@singleton()
export class WorkerMessageHandler {
  constructor(
    @inject("logger") private logger: SimpleLogger,
    @inject("serverContext") private serverContext: ServerContext
  ) {
    logger.info("primary ipc message handler instantiated!");
  }

  /**
   * handle message from primary server
   * @param message ipc message from primary
   */
  async handleMessage(message: IPCMessage) {
    try {
      this.logger.info(
        `ipc message received on worker of type: ${message.type}`
      );
      this.logger.debug(
        `ipc message received on worker: ${JSON.stringify(message)}`
      );

      switch (message.type) {
        case IPCMessageType.REGISTER:
          break;

        case IPCMessageType.USER_MESSAGE:
          break;

        case IPCMessageType.BROADCAST_MESSAGE:
          break;

        default: // do nothing here
      }
    } catch (error) {
      this.logger.error(
        `error occured while handling message on worker process with id: ${process.pid}`
      );
    }
  }
}
