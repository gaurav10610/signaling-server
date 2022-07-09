import { WorkerMessageHandler } from "./ipc/WorkerMessageHandler";
import cluster from "cluster";
import { inject, singleton } from "tsyringe";
import { SimpleLogger } from "./logging/SimpleLogger";
import { GroupContext } from "./types/context";
import { CommonUtils } from "./utils/CommonUtils";
import { ServerConstants } from "./utils/ServerConstants";
import { WsServer } from "./ws/server/WsServer";
import { InMemoryServerContext } from "./context/InMemoryServerContext";

@singleton()
export class WorkerServer {
  constructor(
    @inject("serverConfig") serverConfig: any,
    @inject("logger") private logger: SimpleLogger,
    @inject("wsServer") private wsServer: WsServer,
    @inject("serverContext") private serverContext: InMemoryServerContext,
    @inject("ipcMessageHandler") private ipcMessageHandler: WorkerMessageHandler
  ) {
    this.logger.info(`initializaing worker server instance!`);
  }

  async init(): Promise<void> {
    ServerConstants.DEFAULT_GROUPS.forEach((groupName) => {
      const groupContext: GroupContext = {
        id: CommonUtils.generateUniqueId(),
        groupName,
        users: new Map(),
        createAt: new Date(),
      };
      this.serverContext.storeGroupContext(groupName, groupContext);
    });

    // set the server id in context
    this.serverContext.setServerId(parseInt(process.env.SERVER_ID!));

    // initialize the socket server
    await this.wsServer.init();

    cluster.worker!.on("message", this.ipcMessageHandler.handleMessage.bind(this.ipcMessageHandler));
  }
}
