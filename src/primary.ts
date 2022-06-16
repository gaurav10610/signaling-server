import { SignalingApiServer } from "./rest/api-server";
import { Worker } from "cluster";
import { inject, singleton } from "tsyringe";
import { SimpleLogger } from "./logging/logger-impl";
import { GroupContext, ServerContext } from "./types/context";
import { IPCMessage, IPCMessageType } from "./types/message";
import { CommonUtils } from "./utils/common-utils";
import { ServerConstants } from "./utils/ServerConstants";

@singleton()
export class PrimaryServer {
  private workers: Worker[] = [];
  constructor(
    @inject("logger") private logger: SimpleLogger,
    @inject("serverContext") private serverContext: ServerContext,
    @inject("apiServer") private apiServer: SignalingApiServer
  ) {
    this.logger.info(`initializing master server instance!`);
  }

  setWorkers(workers: Worker[]) {
    this.workers.push(...workers);
  }

  async init(): Promise<void> {
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
    this.workers.forEach((worker) => {
      worker.on("message", (message: IPCMessage) => {
        this.logger.info(
          `ipc message received on master of type: ${message.type}`
        );
        this.logger.debug(
          `ipc message received on master: ${JSON.stringify(message)}`
        );

        switch (message.type) {
          case IPCMessageType.REGISTER:
            break;

          case IPCMessageType.DEREGISTER:
            break;

          case IPCMessageType.USER_MESSAGE:
            break;

          case IPCMessageType.BROADCAST_MESSAGE:
            break;

          default:
          // do nothing here
        }
      });
    });
  }
}
