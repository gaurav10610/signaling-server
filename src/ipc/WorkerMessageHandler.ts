import { UserContext } from "./../types/context";
import { WorkerUserServiceImpl } from "./../service/impl/WorkerUserServiceImpl";
import { IPCMessage, IPCMessageType } from "../types/message";
import { inject, singleton } from "tsyringe";
import { SimpleLogger } from "../logging/SimpleLogger";
import { InMemoryServerContext } from "../context/InMemoryServerContext";

@singleton()
export class WorkerMessageHandler {
  constructor(
    @inject("logger") private logger: SimpleLogger,
    @inject("serverContext") private serverContext: InMemoryServerContext,
    @inject("userService") private userService: WorkerUserServiceImpl
  ) {
    logger.info("primary ipc message handler instantiated!");
  }

  /**
   * handle message from primary server
   * @param message ipc message from primary
   */
  async handleMessage(message: IPCMessage) {
    try {
      this.logger.info(`ipc message received on worker of type: ${message.type}`);
      this.logger.debug(`ipc message received on worker: `, message);

      switch (message.type) {
        case IPCMessageType.USER_REGISTER:
          this.userService.handleUserRegister(message.message as UserContext);
          break;

        case IPCMessageType.USER_DEREGISTER:
          this.userService.handleUserDeRegister(message.message as UserContext);
          break;

        case IPCMessageType.BROADCAST_MESSAGE:
          break;

        default: // do nothing here
      }
    } catch (error) {
      this.logger.error(`error occured while handling ipc message on worker `, { error });
    }
  }
}
