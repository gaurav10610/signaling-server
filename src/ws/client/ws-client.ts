import { IncomingMessage } from "http";
import { CustomWebSocket } from "../../types/websocket";
import { ConnectAck, SignalingMessageType } from "../../types/message";
import { ServerConstants } from "../../utils/ServerConstants";
import { WebSocketHelper } from "../helper/ws-helper";
export class WsClientHandler {
  private readonly wsHelper: WebSocketHelper;
  constructor(wsHelper: WebSocketHelper) {
    global.logger.info(`websocket client handler initialized!`);
    this.wsHelper = wsHelper;
  }

  /**
   * websocket 'connection' event handler
   * @param webSocket
   * @param request http request object
   */
  onClientConnect(webSocket: CustomWebSocket, request: IncomingMessage) {
    global.serverContext.setClientConnection(webSocket);
    this.handleConnectionOpen(webSocket);
    webSocket.on("close", (code: number, reason: Buffer) => {
      this.wsHelper.handleClientDisconnect(webSocket);
    });
    webSocket.on("error", (error: Error) => {
      this.handleClientError(error, webSocket);
    });
    webSocket.on("message", (message: any) => {
      this.wsHelper.handleClientMessage(message, webSocket);
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

  handleClientError(error: Error, webSocket: CustomWebSocket) {
    global.logger.info(
      `error occured on websocket connection with id: ${webSocket.id} & reason: ${error.message}`
    );
  }
}
