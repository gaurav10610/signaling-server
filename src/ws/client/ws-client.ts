import { IncomingMessage } from "http";
import { CustomWebSocket } from "../../types/websocket";
import WebSocket, {
  CloseEvent,
  ErrorEvent,
  Event,
  MessageEvent,
  Server,
} from "ws";
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
    webSocket.on("close", this.onClientClose.bind(this));
    webSocket.on("error", this.onClientError.bind(this));
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

  onClientClose(event: any) {
    const webSocket: CustomWebSocket = <CustomWebSocket>event.target;
    global.logger.info(`websocket connection closed with id: ${webSocket.id}`);
  }

  onClientError(error: ErrorEvent) {
    const webSocket: CustomWebSocket = <CustomWebSocket>error.target;
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
