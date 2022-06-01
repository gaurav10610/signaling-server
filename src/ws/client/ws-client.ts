import { IncomingMessage } from "http";
import { CustomWebSocket } from "../../types/websocket";
import {
  BaseSignalingMessage,
  ConnectAck,
  SignalingMessageType,
} from "../../types/message";
import { ServerConstants } from "../../utils/ServerConstants";
export class WsClientHandler {
  constructor() {
    global.logger.info(`websocket client handler constructed!`);
  }

  onClientConnect(webSocket: CustomWebSocket, request: IncomingMessage) {
    global.serverContext.setClientConnection(webSocket);
    this.handleConnectionOpen(webSocket);
    webSocket.on("close", (code: number, reason: Buffer) => {
      this.handleClientDisconnect(webSocket);
    });
    webSocket.on("error", (error: Error) => {
      this.handleClientError(error, webSocket);
    });
    webSocket.on("message", (message: any) => {
      this.handleClientMessage(message, webSocket);
    });
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

  handleClientDisconnect(webSocket: CustomWebSocket) {
    global.logger.info(
      `websocket connection with id: ${webSocket.id} is closed`
    );
  }

  handleClientError(error: Error, webSocket: CustomWebSocket) {
    global.logger.info(
      `error occured on websocket connection with id: ${webSocket.id} & reason: ${error.message}`
    );
  }

  handleClientMessage(jsonMessage: any, webSocket: CustomWebSocket) {
    global.logger.info(`received message from client with id: ${webSocket.id}`);
    global.logger.info(jsonMessage);
    const message: BaseSignalingMessage = JSON.parse(jsonMessage);
  }
}
