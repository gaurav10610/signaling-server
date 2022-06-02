import {
  BaseSignalingMessage,
  IPCMessage,
  IPCMessageType,
  RegisterAck,
  SignalingMessageType,
} from "../../types/message";
import { ServerContext, UserContext } from "../../types/user-context";
import { CustomWebSocket } from "../../types/websocket";
import { ServerConstants } from "../../utils/ServerConstants";
import cluster from "cluster";

export class WebSocketHelper {
  constructor() {
    global.logger.info(`websocket helper initialiazed!`);
  }

  /**
   * handle message received from a client
   * @param jsonMessage
   * @param webSocket
   */
  async handleClientMessage(
    jsonMessage: any,
    webSocket: CustomWebSocket
  ): Promise<void> {
    global.logger.info(`received message from client with id: ${webSocket.id}`);
    global.logger.debug(jsonMessage);
    try {
      const message: BaseSignalingMessage = JSON.parse(jsonMessage);
    } catch (e) {
      global.logger.error(
        `error handling message from websocket connection with id: ${webSocket.id}`
      );
    }
  }

  /**
   * handle user registeration on signaling server
   * @param message received message on server
   * @param webSocket websocket client connection
   */
  async handleClientRegister(
    message: BaseSignalingMessage,
    webSocket: CustomWebSocket
  ): Promise<void> {
    // registeration acknowledgement for user
    const registerAck: RegisterAck = {
      type: SignalingMessageType.REGISTER,
      from: ServerConstants.THE_INSTASHARE_SERVER,
      to: message.from,
      success: false,
    };

    /**
     * check if the received username is unique using server context
     */
    if (global.serverContext.hasUserContext(message.from)) {
      global.logger.debug(`registeration failed for user: ${message.from}`);
      this.sendSocketMessage(registerAck);
      return;
    }

    /**
     * register the user on server and create a user context
     */
    const userContext: UserContext = {
      username: message.from,
      connectedAt: new Date(),
      connectionIds: [],
    };

    userContext.connectionIds.push(webSocket.id!);
    global.serverContext.setUserContext(message.from, userContext);
    registerAck.success = true;
    this.sendSocketMessage(registerAck);
  }

  /**
   * handle user de-regiter on signaling-server
   * @param message received message on server
   * @param webSocket websocket client connection
   */
  async handleClientDeRegister(
    message: BaseSignalingMessage,
    webSocket: CustomWebSocket
  ): Promise<void> {
    if (global.serverContext.hasUserContext(message.from)) {
      const serverContext: ServerContext = global.serverContext;
      const userContext: UserContext = serverContext.getUserContext(
        message.from
      )!;

      serverContext.removeUserContext(message.from);
      const groups: string[] | undefined = userContext.groups;

      /**
       * if user is part of any group then mark him/her inactive from that group
       */
      if (groups && groups.length > 0) {
        groups.forEach((groupName) => {
          serverContext.removeUserFromGroup(
            webSocket.id!,
            message.from,
            groupName
          );
        });
      }
    }
  }

  /**
   * broadcast the specified message to all the clients
   * @param message message payload that needs to be sent
   */
  async broadCastMessage(message: BaseSignalingMessage): Promise<void> {
    global.serverContext
      .getConnections()
      .forEach((socketConnection, connectionId) => {
        try {
          socketConnection.send(JSON.stringify(message));
        } catch (e) {
          global.logger.error(
            `unable to send broadcast message to: ${connectionId}`
          );
        }
      });

    /**
     * if server is running in cluster mode then send this message
     * to master process which will send this message to clients connected
     * to other server instances as well
     */
    if (cluster.isWorker) {
      const ipcMessage: IPCMessage = {
        message: message,
        type: IPCMessageType.BROADCAST_MESSAGE,
      };
      process.send!(ipcMessage);
    }
  }

  /**
   * send a message to appropriate user/users
   * @param message
   */
  async sendSocketMessage(message: BaseSignalingMessage): Promise<void> {
    if (message.to instanceof Array) {
      message.to.forEach((recipient) => {
        /**
         * if the server is running in cluster mode and recipient doesn't exist
         * of this server then there might be a case that, the recipient is connected
         * to some other server process
         */
        if (cluster.worker && !global.serverContext.hasUserContext(recipient)) {
          message.to = recipient;
          const ipcMessage: IPCMessage = {
            message,
            type: IPCMessageType.USER_MESSAGE,
          };
          process.send!(ipcMessage);
        } else {
          global.serverContext
            .getUserConnections(recipient)
            ?.forEach((webSocket) => webSocket.send(message));
        }
      });
    } else {
      // send message to single recipient
      global.serverContext
        .getUserConnections(message.to)
        ?.forEach((webSocket) => webSocket.send(message));
    }
  }

  /**
   * handle websocket client disconnect
   * @param webSocket 
   */
  async handleClientDisconnect(webSocket: CustomWebSocket): Promise<void> {
    global.logger.info(
      `websocket connection with id: ${webSocket.id} is closed`
    );
  }
}
