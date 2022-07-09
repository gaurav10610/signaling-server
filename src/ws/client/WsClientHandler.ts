import { WorkerUserService } from "./../../service/user-spec";
import { ClientConnectionStatus, IPCMessageType } from "../../types/message";
import { ServerContext } from "../../types/context";
import { IncomingMessage } from "http";
import { CustomWebSocket } from "../../types/websocket";
import { BaseSignalingMessage, ConnectAck, SignalingMessageType } from "../../types/message";
import { ServerConstants } from "../../utils/ServerConstants";
import { CommonUtils } from "../../utils/CommonUtils";
import { inject, singleton } from "tsyringe";
import { SimpleLogger } from "../../logging/SimpleLogger";
import { CommunicationService } from "../../service/communication-spec";

@singleton()
export class WsClientHandler {
  constructor(
    @inject("logger") private logger: SimpleLogger,
    @inject("userService") private userService: WorkerUserService,
    @inject("serverContext") private serverContext: ServerContext,
    @inject("communicationService")
    private communicationService: CommunicationService
  ) {
    this.logger.info(`websocket client handler initialized!`);
  }

  /**
   * websocket 'connection' event handler
   * @param webSocket
   * @param request http request object
   */
  onClientConnect(webSocket: CustomWebSocket, request: IncomingMessage) {
    // assign id to websocket connection
    webSocket.id = CommonUtils.generateUniqueId();
    this.handleConnectionOpen(webSocket);
    webSocket.on("message", (message: any) => {
      /**
       * @TODO integrate authentication flow here
       */
      this.handleClientMessage(message, webSocket);
    });

    webSocket.on("close", (code: number, reason: Buffer) => {
      this.userService.handleClientDisconnect(webSocket);
    });

    webSocket.on("error", (error: Error) => {
      this.userService.handleClientError(error, webSocket);
    });
  }

  /**
   * handle message received from a client
   * @param jsonMessage
   * @param webSocket
   */
  async handleClientMessage(jsonMessage: any, webSocket: CustomWebSocket): Promise<void> {
    this.logger.info(`message received: ${jsonMessage}`);
    try {
      const message: BaseSignalingMessage = JSON.parse(jsonMessage);
      message.isClientMessage = true;
      switch (message.type) {
        default:
          this.communicationService.sendSocketMessage(message);
          break;
      }
    } catch (e) {
      this.logger.error(`error handling message from websocket connection with id: ${webSocket.id}`);
    }
  }

  /**
   * send connection id to websocket client
   * @param webSocket
   */
  handleConnectionOpen(webSocket: CustomWebSocket) {
    this.logger.info(`websocket connection open with id: ${webSocket.id!}`);
    this.serverContext.storeClientConnection(webSocket.id!, {
      serverId: this.serverContext.getServerId()!,
      webSocket,
    });
    const acknowledment: ConnectAck = {
      from: ServerConstants.THE_INSTASHARE_SERVER,
      to: ServerConstants.THE_INSTASHARE_SERVER,
      authorization: webSocket.id!,
      type: SignalingMessageType.CONNECT,
      connectionId: webSocket.id!,
    };

    /**
     * send the socket id to client for all the subsequent communication
     */
    webSocket.send(JSON.stringify(acknowledment));

    const connectionStatus: ClientConnectionStatus = {
      connected: true,
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
}
