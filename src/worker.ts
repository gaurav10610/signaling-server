import { ServerOptions } from "ws";
import { InMemoryServerContext } from "./context/server-context";
import { SimpleLogger } from "./logging/logger-impl";
import { ServerConstants } from "./utils/ServerConstants";
import { WsClientHandler } from "./ws/client/ws-client";
import { WsServer } from "./ws/server/ws-server";

function init(): void {
  // configure logger
  global.logger = new SimpleLogger().getLogger();
  global.logger.info(`server has started!`);

  // initialize server context
  global.serverContext = new InMemoryServerContext();

  const options: ServerOptions = {
    port: ServerConstants.WS_PORT,
  };

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
