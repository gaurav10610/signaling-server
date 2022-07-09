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

  async handleUserRegister(message: IPCMessage): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async handleUserDeRegister(message: IPCMessage): Promise<void> {
    throw new Error("Method not implemented.");
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
