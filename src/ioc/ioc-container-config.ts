import { WorkerMessageHandler } from "./../ipc/worker-message-handler";
import { container, Lifecycle } from "tsyringe";
import { ServerOptions as HttpServerOptions } from "https";
import { readFileSync } from "fs";
import { SimpleLogger } from "../logging/logger-impl";
import { InMemoryServerContext } from "../context/server-context";
import { UserServiceImpl } from "../service/impl/user";
import { ApiServiceImpl } from "../service/impl/api";
import { SignalingApiServer } from "../api/api-server";
import cluster from "cluster";
import { WsServerConfig } from "../ws/server-config/ws-server-config";
import { WsClientHandler } from "../ws/client/ws-client";
import { WsServer } from "../ws/server/ws-server";
import { ServerOptions } from "ws";
import { ApiExceptionHandler } from "../exception/handler";
import cors from "cors";
import { CommunicationServiceImpl } from "../service/impl/communication";
import { ServerMiddleWare } from "../api/middleware";
import { PrimaryMessageHandler } from "../ipc/primary-message-handler";

container.register<any>("serverConfig", { useValue: {} });
container.register("logger", SimpleLogger, { lifecycle: Lifecycle.Singleton });
container.register("serverContext", InMemoryServerContext, {
  lifecycle: Lifecycle.Singleton,
});
container.register("communicationService", CommunicationServiceImpl, {
  lifecycle: Lifecycle.Singleton,
});
container.register("userService", UserServiceImpl, {
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
  container.register("wsClientHandler", WsClientHandler, {
    lifecycle: Lifecycle.Singleton,
  });
  container.register("wsServer", WsServer, { lifecycle: Lifecycle.Singleton });
}
