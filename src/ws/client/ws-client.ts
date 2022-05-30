import { IncomingMessage } from "http";
import { CustomWebSocket } from "../../types/websocket";
import { CloseEvent, ErrorEvent, Event, MessageEvent, Server } from "ws";
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
    webSocket.on("open", this.onOpen.bind(this));
    webSocket.on("close", this.onClientClose.bind(this));
    webSocket.on("error", this.onClientError.bind(this));
    webSocket.on("message", this.onClientMessage.bind(this));
  }

  onOpen(event: Event) {
    const webSocket: CustomWebSocket = <CustomWebSocket>event.target;
    global.logger.info(`websocket connection open with id: ${webSocket.id}`);

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

  onClientClose(event: CloseEvent) {
    const webSocket: CustomWebSocket = <CustomWebSocket>event.target;
    global.logger.info(`websocket connection closed with id: ${webSocket.id}`);
  }

  onClientError(error: ErrorEvent) {
    const webSocket: CustomWebSocket = <CustomWebSocket>error.target;
    global.logger.info(
      `error occured on websocket connection with id: ${webSocket.id} & reason: ${error.message}`
    );
  }

  onClientMessage(message: MessageEvent) {
    const webSocket: CustomWebSocket = <CustomWebSocket>message.target;
    if (message.type === "string") {
      global.logger.info(message.data);
      const data: BaseSignalingMessage = <BaseSignalingMessage>(
        JSON.parse(<string>message.data)
      );
    } else {
      global.logger.error(`error parsing message from ${webSocket.id}`);
    }
  }
}
