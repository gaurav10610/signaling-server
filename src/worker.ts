import { ServerOptions } from "ws";
import { InMemoryServerContext } from "./context/server-context";
import { SimpleLogger } from "./logging/logger-impl";
import { CustomWebSocket } from "./types/websocket";
import { ServerConstants } from "./utils/ServerConstants";
import { WsClientHandler } from "./ws/client/ws-client";
import { UserService } from "./ws/helper/ws-helper";
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
      WebSocket: CustomWebSocket,
    };

    // websocket server initialization
    const wsServer: WsServer = new WsServer(
      new WsClientHandler(new UserService()),
      options
    );

    wsServer.registerWsEventHandlers();
  }
}
