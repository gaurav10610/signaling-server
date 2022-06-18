import { ServerContext } from "./../../types/context";
import { SimpleLogger } from "./../../logging/logger-impl";
import { inject, singleton } from "tsyringe";
import {
  BaseSignalingMessage,
  BroadCastType,
  IPCMessage,
  IPCMessageType,
} from "../../types/message";
import { CommunicationService } from "./../../types/communication";
import cluster from "cluster";

@singleton()
export class CommunicationServiceImpl implements CommunicationService {
  constructor(
    @inject("logger") private logger: SimpleLogger,
    @inject("serverContext") private serverContext: ServerContext
  ) {
    this.logger.info(`communication service is instantiated!`);
  }

  /**
   * send a message to primary server
   * @param message
   */
  async sendPrimaryServerMessage(message: IPCMessage): Promise<void> {
    process.send!(message);
  }

  /**
   * send a socket message to one/more recipients
   * @param data
   */
  async sendSocketMessage(data: BaseSignalingMessage): Promise<void> {
    if (data.to instanceof Array) {
      data.to.forEach((recipient) => {
        /**
         * if the server is running in cluster mode and recipient doesn't exist
         * of this server then there might be a case that, the recipient is connected
         * to some other server process
         */
        if (this.serverContext.hasUserContext(recipient)) {
          this.serverContext
            .getUserConnections(recipient)
            .forEach((webSocket) => webSocket.send(JSON.stringify(data)));
        } else if (data.isClientMessage) {
          const signalingMessage: BaseSignalingMessage = {
            ...data,
          };
          signalingMessage.to = recipient;
          const ipcMessage: IPCMessage = {
            message: signalingMessage,
            type: IPCMessageType.USER_MESSAGE,
            serverId: parseInt(process.env.SERVER_ID!),
          };
          this.sendPrimaryServerMessage(ipcMessage);
        }
      });
    } else {
      // send message to single recipient

      if (this.serverContext.hasUserContext(data.to)) {
        this.serverContext
          .getUserConnections(data.to)
          .forEach((webSocket) => webSocket.send(JSON.stringify(data)));
      } else if (data.isClientMessage) {
        const ipcMessage: IPCMessage = {
          message: data,
          type: IPCMessageType.USER_MESSAGE,
          serverId: parseInt(process.env.SERVER_ID!),
        };
        this.sendPrimaryServerMessage(ipcMessage);
      }
    }
  }

  /**
   * broadcast a message to all connected clients of websocket server
   * @param data
   */
  async broadCastMessage(data: BaseSignalingMessage): Promise<void> {
    const ipcMessage: IPCMessage = {
      message: data,
      type: IPCMessageType.BROADCAST_MESSAGE,
      serverId: parseInt(process.env.SERVER_ID!),
    };
    this.sendPrimaryServerMessage(ipcMessage);
    if (data.broadCastType === BroadCastType.ALL) {
      for (const webSocket of this.serverContext.getConnections().values()) {
        webSocket.send(JSON.stringify(data));
      }
    }
  }
}
