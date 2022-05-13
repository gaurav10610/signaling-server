import { ServerOptions, WebSocket, WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import { CommonUtils } from "../utils/common-utils";

export class WsServer {
  private webSocketServer: WebSocketServer;

  constructor(options: ServerOptions, callback: (() => void) | undefined) {
    this.webSocketServer = new WebSocketServer(options, callback);
  }

  registerWsEventHandlers() {
    this.webSocketServer.on("close", this.handleWsServerClose.bind(this));
    this.webSocketServer.on("connection", this.handleClientConnect.bind(this));
    this.webSocketServer.on("error", this.handleServerError.bind(this));
  }

  handleWsServerClose() {
    console.log("web socket server is closed");
  }

  handleClientConnect(webSocket: WebSocket, request: IncomingMessage) {
    console.log(`new client connected!`);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    webSocket.id = CommonUtils.generateUniqueId();
  }

  handleServerError(error: Error) {
    console.log(
      `error encountered on ws server with name: ${error.name} & message: ${error.message}`
    );
  }
}
