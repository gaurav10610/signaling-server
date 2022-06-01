import { ServerOptions } from "ws";
import { InMemoryServerContext } from "./context/server-context";
import { SimpleLogger } from "./logging/logger-impl";
import { ServerConstants } from "./utils/ServerConstants";
import { WsClientHandler } from "./ws/client/ws-client";
import { WsServer } from "./ws/server/ws-server";

export class WorkerServer {
  private readonly serverConfig: any;
  constructor(serverConfig: any) {
    this.serverConfig = serverConfig;
  }

  public async init(): Promise<void> {
    // configure logger
    global.logger = new SimpleLogger().getLogger();
    global.logger.info(`initializaing worker server instance!`);

    // initialize server context
    global.serverContext = new InMemoryServerContext();

    const options: ServerOptions = {
      port: ServerConstants.WS_PORT,
    };

    // websocket server initialization
    const wsServer: WsServer = new WsServer(
      new WsClientHandler(),
      options,
      () => {
        global.logger.info(
          `web socket started at port: ${ServerConstants.WS_PORT}`
        );
      }
    );

    wsServer.registerWsEventHandlers();
  }
}
