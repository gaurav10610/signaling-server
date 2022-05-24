import { IncomingMessage } from "http";
import { CustomWebSocket } from "../../types/websocket";
import { CloseEvent, ErrorEvent, Event, MessageEvent } from "ws";
import {
  BaseSignalingMessage,
  SignalingMessageType,
} from "../../types/message";

export class WsClientHandler {
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
      const data: BaseSignalingMessage = <BaseSignalingMessage>(
        JSON.parse(<string>message.data)
      );

      switch (data.type) {
        case SignalingMessageType.REGISTER:
          break;

        case SignalingMessageType.DEREGISTER:
          break;

        default:
      }
    } else {
      global.logger.error(`error parsing message from ${webSocket.id}`);
    }
  }
}
