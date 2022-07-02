import { PrimaryMessageHandler } from "./ipc/PrimaryMessageHandler";
import { SignalingApiServer } from "./api/SignalingApiServer";
import { Worker } from "cluster";
import { inject, singleton } from "tsyringe";
import { SimpleLogger } from "./logging/SimpleLogger";
import { GroupContext, ServerContext } from "./types/context";
import {
  ClientConnectionStatus,
  IPCMessage,
  IPCMessageType,
} from "./types/message";
import { CommonUtils } from "./utils/CommonUtils";
import { ServerConstants } from "./utils/ServerConstants";

@singleton()
export class PrimaryServer {
  constructor(
    @inject("logger") private logger: SimpleLogger,
    @inject("serverContext") private serverContext: ServerContext,
    @inject("apiServer") private apiServer: SignalingApiServer,
    @inject("ipcMessageHandler")
    private ipcMessageHandler: PrimaryMessageHandler
  ) {
    this.logger.info(`initializing master server instance!`);
  }

  async init(workers: Map<number, Worker>): Promise<void> {
    /**
     * create group context for groups
     */
    ServerConstants.DEFAULT_GROUPS.forEach((groupName) => {
      const groupContext: GroupContext = {
        id: CommonUtils.generateUniqueId(),
        groupName,
        users: new Map(),
        createAt: new Date(),
      };
      this.serverContext.storeGroupContext(groupName, groupContext);
    });

    // configure & start api server
    await this.apiServer.init();

    /**
     * register ipc message listeners on worker processes
     */
    for (const [serverId, worker] of workers.entries()) {
      // store in server context
      this.serverContext.setWorker(serverId, worker);
      worker.on(
        "message",
        this.ipcMessageHandler.handleIpcMessage.bind(this.ipcMessageHandler)
      );
    }
  }
}
