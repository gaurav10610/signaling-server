import { ServerOptions, WebSocketServer } from "ws";
import { WsClientHandler } from "../client/ws-client";

export class WsServer {
  private readonly server: WebSocketServer;
  private readonly clientHandler: WsClientHandler;

  constructor(
    wsClientHandler: WsClientHandler,
    options: ServerOptions,
    callback: (() => void) | undefined
  ) {
    this.server = new WebSocketServer(options, callback);
    this.clientHandler = wsClientHandler;
  }

  registerWsEventHandlers() {
    this.server.on("close", this.onServerClose.bind(this));
    this.server.on(
      "connection",
      this.clientHandler.onClientConnect.bind(this.clientHandler)
    );
    this.server.on("error", this.onServerError.bind(this));
  }

  private onServerClose() {
    global.logger.info("web socket server is closed");
  }

  private onServerError(error: Error) {
    global.logger.error(
      `error encountered on ws server with name: ${error.name} & message: ${error.message}`
    );
  }
}
