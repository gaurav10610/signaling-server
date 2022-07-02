import { WorkerUserServiceImpl } from "./../service/impl/WorkerUserServiceImpl";
import { PrimaryUserServiceImpl } from "./../service/impl/PrimaryUserServiceImpl";
import { WorkerMessageHandler } from "../ipc/WorkerMessageHandler";
import { container, Lifecycle } from "tsyringe";
import { ServerOptions as HttpServerOptions } from "https";
import { readFileSync } from "fs";
import { SimpleLogger } from "../logging/SimpleLogger";
import { InMemoryServerContext } from "../context/InMemoryServerContext";
import { ApiServiceImpl } from "../service/impl/ApiServiceImpl";
import { SignalingApiServer } from "../api/SignalingApiServer";
import cluster from "cluster";
import { WsServerConfig } from "../ws/server-config/ws-server-config";
import { WsClientHandler } from "../ws/client/WsClientHandler";
import { WsServer } from "../ws/server/WsServer";
import { ServerOptions } from "ws";
import { ApiExceptionHandler } from "../exception/ApiExceptionHandler";
import cors from "cors";
import { CommunicationServiceImpl } from "../service/impl/CommunicationServiceImpl";
import { ServerMiddleWare } from "../api/ServerMiddleWare";
import { PrimaryMessageHandler } from "../ipc/PrimaryMessageHandler";

container.register<any>("serverConfig", { useValue: {} });
container.register("logger", SimpleLogger, { lifecycle: Lifecycle.Singleton });
container.register("serverContext", InMemoryServerContext, {
  lifecycle: Lifecycle.Singleton,
});
container.register("communicationService", CommunicationServiceImpl, {
  lifecycle: Lifecycle.Singleton,
});

// primary process configuration
if (cluster.isPrimary) {
  container.register("serverMiddleWare", ServerMiddleWare, {
    lifecycle: Lifecycle.Singleton,
  });
  container.register("ipcMessageHandler", PrimaryMessageHandler, {
    lifecycle: Lifecycle.Singleton,
  });
  container.register("userService", PrimaryUserServiceImpl, {
    lifecycle: Lifecycle.Singleton,
  });
  container.register<HttpServerOptions>("apiServerOptions", {
    useValue: {
      cert: readFileSync("ssl/certificate.pem", "utf8"),
      key: readFileSync("ssl/private.pem", "utf8"),
    },
  });
  container.register<cors.CorsOptions>("corsOptions", {
    useValue: {
      origin:
        process.env.NODE_ENV === "dev"
          ? process.env.ALLOWED_ORIGINS
          : process.env.ALLOWED_ORIGINS!.split(","),
    },
  });
  container.register("apiErrorHandler", ApiExceptionHandler, {
    lifecycle: Lifecycle.Singleton,
  });
  container.register("apiService", ApiServiceImpl, {
    lifecycle: Lifecycle.Singleton,
  });
  container.register("apiServer", SignalingApiServer, {
    lifecycle: Lifecycle.Singleton,
  });
}

// worker process configuration
if (cluster.isWorker) {
  container.register<ServerOptions>("wsServerConfig", {
    useValue: WsServerConfig,
  });
  container.register("ipcMessageHandler", WorkerMessageHandler, {
    lifecycle: Lifecycle.Singleton,
  });
  container.register("userService", WorkerUserServiceImpl, {
    lifecycle: Lifecycle.Singleton,
  });
  container.register("wsClientHandler", WsClientHandler, {
    lifecycle: Lifecycle.Singleton,
  });
  container.register("wsServer", WsServer, { lifecycle: Lifecycle.Singleton });
}
