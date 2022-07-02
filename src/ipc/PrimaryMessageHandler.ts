import { ServerContext } from "../types/context";
import { ClientConnectionStatus, IPCMessage, IPCMessageType } from "../types/message";
import { SimpleLogger } from "../logging/SimpleLogger";
import { inject, singleton } from "tsyringe";
import { PrimaryUserService } from "../service/user-spec";

@singleton()
export class PrimaryMessageHandler {
  constructor(
    @inject("logger") private logger: SimpleLogger,
    @inject("serverContext") private serverContext: ServerContext,
    @inject("userService") private userService: PrimaryUserService
  ) {
    logger.info("primary ipc message handler instantiated!");
  }

  /**
   * handle messages sent from worker processes
   * @param message ipc message from worker
   */
  async handleMessage(message: IPCMessage) {
    try {
      this.logger.debug("ipc message received on primary", message);
      switch (message.type) {
        // update client connection state in context
        case IPCMessageType.CONNECTION_STATUS:
          this.userService.handleUserConnectionStatus(message);
          break;

        case IPCMessageType.USER_MESSAGE:
          break;

        case IPCMessageType.BROADCAST_MESSAGE:
          break;

        default:
        // do nothing here
      }
    } catch (error) {
      this.logger.error(`error encounter while handling ipc message from worker`, { error });
    }
  }
}
