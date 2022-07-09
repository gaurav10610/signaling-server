import { UserContext } from "./../../types/context";
import { CommunicationServiceImpl } from "./CommunicationServiceImpl";
import { inject, singleton } from "tsyringe";
import { InMemoryServerContext } from "../../context/InMemoryServerContext";
import { SimpleLogger } from "../../logging/SimpleLogger";
import { ClientConnectionStatus, IPCMessage, IPCMessageType } from "../../types/message";
import { CustomWebSocket } from "../../types/websocket";
import { WorkerUserService } from "./../user-spec";

@singleton()
export class WorkerUserServiceImpl implements WorkerUserService {
  constructor(
    @inject("logger") private logger: SimpleLogger,
    @inject("serverContext") private serverContext: InMemoryServerContext,
    @inject("communicationService")
    private communicationService: CommunicationServiceImpl
  ) {
    this.logger.info(`worker user service instantiated!`);
  }

  /**
   * handle user registration happened on primary server
   * @param userContext context of user
   */
  async handleUserRegister(userContext: UserContext): Promise<void> {
    for (const connectionId of userContext.connectionIds) {
      if (!this.serverContext.hasClientConnection(connectionId)) {
        this.logger.error(`connectionId: ${connectionId} does not exist for registered user: ${userContext.username}`);

        /**
         * @TODO handle error here
         */
        return;
      }
      this.serverContext.getClientConnection(connectionId)!.username = userContext.username;
    }
    this.serverContext.storeUserContext(userContext.username, userContext);
  }

  /**
   * handle user de-register happened on primary server
   * @param userContext
   */
  async handleUserDeRegister(userContext: UserContext): Promise<void> {
    for (const connectionId of userContext.connectionIds) {
      if (!this.serverContext.hasClientConnection(connectionId)) {
        this.logger.error(
          `connectionId: ${connectionId} does not exist for de-registered user: ${userContext.username}`
        );
        continue;
      }
      delete this.serverContext.getClientConnection(connectionId)!.username;
    }
    /**
     * remove user from all the groups
     */
    if (userContext.groups) {
      userContext.groups.forEach((groupName) => {
        this.serverContext.removeUserFromGroup(userContext.username, groupName);
      });
    }
    this.serverContext.removeUserContext(userContext.username);
  }

  async handleGroupRegister(message: IPCMessage): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async handleGroupDeRegister(message: IPCMessage): Promise<void> {
    throw new Error("Method not implemented.");
  }

  /**
   * handle websocket client disconnect
   * @param webSocket
   */
  async handleClientDisconnect(webSocket: CustomWebSocket): Promise<void> {
    this.logger.info(`websocket connection closed with id: ${webSocket.id}`);
    this.serverContext.removeClientConnection(webSocket.id!);

    const connectionStatus: ClientConnectionStatus = {
      connected: false,
      connectionId: webSocket.id!,
      serverId: this.serverContext.getServerId()!,
    };

    // update the primary process about the new client connection
    this.communicationService.sendPrimaryServerMessage({
      type: IPCMessageType.CONNECTION_STATUS,
      serverId: this.serverContext.getServerId()!,
      message: connectionStatus,
    });
  }

  /**
   * handle error on websocket connection
   * @param error
   * @param webSocket
   */
  async handleClientError(error: Error, webSocket: CustomWebSocket): Promise<void> {
    this.logger.error(`error occured on client connection with id: ${webSocket.id}`);
  }
}
