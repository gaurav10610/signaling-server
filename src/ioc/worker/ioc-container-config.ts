import { container, Lifecycle } from "tsyringe";
import { ServerOptions } from "ws";
import { InMemoryServerContext } from "../../context/server-context";
import { SimpleLogger } from "../../logging/logger-impl";
import { UserServiceImpl } from "../../service/impl/user";
import { WsClientHandler } from "../../ws/client/ws-client";
import { WsServerConfig } from "../../ws/server-config/ws-server-config";
import { WsServer } from "../../ws/server/ws-server";

container.register<any>("serverConfig", { useValue: {} });
container.register("logger", SimpleLogger, { lifecycle: Lifecycle.Singleton });
container.register("serverContext", InMemoryServerContext, {
  lifecycle: Lifecycle.Singleton,
});
container.register<ServerOptions>("wsServerConfig", {
  useValue: WsServerConfig,
});
container.register("userService", UserServiceImpl, {
  lifecycle: Lifecycle.Singleton,
});
container.register("wsClientHandler", WsClientHandler, {
  lifecycle: Lifecycle.Singleton,
});
container.register("wsServer", WsServer, { lifecycle: Lifecycle.Singleton });
