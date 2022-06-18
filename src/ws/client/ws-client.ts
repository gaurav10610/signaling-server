import { IncomingMessage } from "http";
import { CustomWebSocket } from "../../types/websocket";
import {
  BaseSignalingMessage,
  ConnectAck,
  GroupRegisterMessage,
  SignalingMessageType,
} from "../../types/message";
import { ServerConstants } from "../../utils/ServerConstants";
import { CommonUtils } from "../../utils/common-utils";
import { inject, singleton } from "tsyringe";
import { SimpleLogger } from "../../logging/logger-impl";
import { UserService } from "../../service/user-spec";
import { CommunicationService } from "../../types/communication";

@singleton()
export class WsClientHandler {
  constructor(
    @inject("logger") private logger: SimpleLogger,
    @inject("userService") private userService: UserService,
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

    // handler for logging only
    webSocket.on("close", (code: number, reason: Buffer) => {
      this.logger.info(
        `websocket connection with id: ${webSocket.id} is closed`
      );
    });

    // handler for logging only
    webSocket.on("error", (error: Error) => {
      this.logger.info(
        `error occured on websocket connection with id: ${webSocket.id} & reason: ${error.message}`
      );
    });
  }

  /**
   * handle message received from a client
   * @param jsonMessage
   * @param webSocket
   */
  async handleClientMessage(
    jsonMessage: any,
    webSocket: CustomWebSocket
  ): Promise<void> {
    this.logger.info(`message received: ${jsonMessage}`);
    try {
      const message: BaseSignalingMessage = JSON.parse(jsonMessage);
      message.isClientMessage = true;
      switch (message.type) {
        case SignalingMessageType.REGISTER:
          this.userService.handleClientRegister(message, webSocket);
          break;

        case SignalingMessageType.DEREGISTER:
          this.userService.handleClientDeRegister(message, webSocket);
          break;

        default:
          this.communicationService.sendSocketMessage(message);
          break;
      }
    } catch (e) {
      this.logger.error(
        `error handling message from websocket connection with id: ${webSocket.id}`
      );
    }
  }

  /**
   * send connection id to websocket client
   * @param webSocket
   */
  handleConnectionOpen(webSocket: CustomWebSocket) {
    const acknowledment: ConnectAck = {
      from: ServerConstants.THE_INSTASHARE_SERVER,
      to: ServerConstants.THE_INSTASHARE_SERVER,
      authorization: webSocket.id!,
      type: SignalingMessageType.CONNECT,
    };

    /**
     * send the socket id to client for all the subsequent communication
     */
    webSocket.send(JSON.stringify(acknowledment));
  }
}
