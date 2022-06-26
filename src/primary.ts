import { SignalingApiServer } from "./rest/api-server";
import { Worker } from "cluster";
import { inject, singleton } from "tsyringe";
import { SimpleLogger } from "./logging/logger-impl";
import { GroupContext, ServerContext } from "./types/context";
import {
  ClientConnectionStatus,
  IPCMessage,
  IPCMessageType,
} from "./types/message";
import { CommonUtils } from "./utils/common-utils";
import { ServerConstants } from "./utils/ServerConstants";

@singleton()
export class PrimaryServer {
  constructor(
    @inject("logger") private logger: SimpleLogger,
    @inject("serverContext") private serverContext: ServerContext,
    @inject("apiServer") private apiServer: SignalingApiServer
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

      worker.on("message", (message: IPCMessage) => {
        this.logger.info(
          `ipc message received on master of type: ${message.type}`
        );
        this.logger.debug(
          `ipc message received on master: ${JSON.stringify(message)}`
        );

        switch (message.type) {
          // update client connection state in context
          case IPCMessageType.CONNECTION_STATUS:
            const connectionStatus: ClientConnectionStatus =
              message.message as ClientConnectionStatus;
            if (connectionStatus.connected) {
              this.serverContext.storeClientConnection(
                connectionStatus.connectionId,
                {
                  serverId: connectionStatus.serverId,
                }
              );
            } else {
              this.serverContext.removeClientConnection(
                connectionStatus.connectionId
              );
            }
            break;

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
    }
  }
}
