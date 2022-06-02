import { ServerOptions, WebSocketServer } from "ws";
import { WsClientHandler } from "../client/ws-client";

export class WsServer {
  private server: WebSocketServer;
  private clientHandler: WsClientHandler;

  constructor(
    wsClientHandler: WsClientHandler,
    options: ServerOptions,
    callback: (() => void) | undefined
  ) {
    this.server = new WebSocketServer(options, callback);
    this.clientHandler = wsClientHandler;
  }

  /**
   * register server event handlers
   */
  registerWsEventHandlers() {
    this.server.on("close", this.onServerClose.bind(this));
    this.server.on(
      "connection",
      this.clientHandler.onClientConnect.bind(this.clientHandler)
    );
    this.server.on("error", this.onServerError.bind(this));
  }

  /**
   * handle server close
   */
  private onServerClose() {
    global.logger.info("web socket server is closed");
  }

  /**
   * handle server error
   * @param error
   */
  private onServerError(error: Error) {
    global.logger.error(
      `error encountered on ws server with name: ${error.name} & message: ${error.message}`
    );
  }
}
