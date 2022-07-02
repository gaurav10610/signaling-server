import { inject, singleton } from "tsyringe";
import { ServerOptions, WebSocketServer } from "ws";
import { SimpleLogger } from "../../logging/SimpleLogger";
import { WsClientHandler } from "../client/WsClientHandler";

@singleton()
export class WsServer {
  private server: WebSocketServer | undefined;
  constructor(
    @inject("logger") private logger: SimpleLogger,
    @inject("wsClientHandler") private clientHandler: WsClientHandler,
    @inject("wsServerConfig") private options: ServerOptions
  ) {}

  async init(): Promise<void> {
    this.server = new WebSocketServer(this.options, () => {
      this.logger.info(`web socket server started at port: ${process.env.WS_PORT}`);
    });
    this.registerWsEventHandlers();
  }

  /**
   * register server event handlers
   */
  async registerWsEventHandlers(): Promise<void> {
    this.server!.on("close", this.onServerClose.bind(this));
    this.server!.on("connection", this.clientHandler.onClientConnect.bind(this.clientHandler));
    this.server!.on("error", this.onServerError.bind(this));
  }

  /**
   * handle server close
   */
  private onServerClose() {
    this.logger.info("web socket server is closed!");
  }

  /**
   * handle server error
   * @param error
   */
  private onServerError(error: Error) {
    this.logger.error(
      `error encountered on ws server with name: ${error.name} & message: ${error.message}`
    );
  }
}
