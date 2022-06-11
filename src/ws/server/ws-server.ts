import { ServerOptions, WebSocketServer } from "ws";
import { ServerConstants } from "../../utils/ServerConstants";
import { WsClientHandler } from "../client/ws-client";

export class WsServer {
  private server: WebSocketServer;
  private clientHandler: WsClientHandler;

  constructor(wsClientHandler: WsClientHandler, options: ServerOptions) {
    this.server = new WebSocketServer(options, () => {
      global.logger.info(
        `web socket server started at port: ${ServerConstants.WS_PORT}`
      );
    });
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
