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
import { SimpleLogger } from "../../logging/logger-impl";
import { inject, singleton } from "tsyringe";

@singleton()
export class UserService {
  constructor(
    @inject("logger") private logger: SimpleLogger,
    @inject("serverContext") private serverContext: ServerContext
  ) {
    this.logger.info(`websocket helper initialiazed!`);
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
    this.logger.info(`message received: ${jsonMessage}`);
    try {
      const message: BaseSignalingMessage = JSON.parse(jsonMessage);
      switch (message.type) {
        case SignalingMessageType.REGISTER:
          this.handleClientRegister(message, webSocket);
          break;

        case SignalingMessageType.DEREGISTER:
          this.handleClientDeRegister(message, webSocket);
          break;

        default:
          this.sendSocketMessage(message);
          break;
      }
    } catch (e) {
      this.logger.error(
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
    const username: string = message.from;

    // registeration acknowledgement for user
    const registerAck: RegisterAck = {
      type: SignalingMessageType.REGISTER,
      from: ServerConstants.THE_INSTASHARE_SERVER,
      to: username,
      success: false,
    };

    /**
     * check if the received username is unique using server context
     */
    if (this.serverContext.hasUserContext(username)) {
      this.logger.info(`registeration failed for user: ${username}`);
      this.sendSocketMessage(registerAck);
      return;
    }
    this.serverContext.storeClientConnection(webSocket);

    webSocket.on("close", (code: number, reason: Buffer) => {
      this.handleClientDisconnect(webSocket, username);
    });

    webSocket.on("error", (error: Error) => {
      this.handleClientError(error, webSocket, username);
    });

    /**
     * register the user on server and create a user context
     */
    const userContext: UserContext = {
      username,
      connectedAt: new Date(),
      connectionIds: [],
    };

    userContext.connectionIds.push(webSocket.id!);
    this.serverContext.storeUserContext(username, userContext);
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
    const username: string = message.from;
    if (this.serverContext.hasUserContext(username)) {
      const userContext: UserContext =
        this.serverContext.getUserContext(username)!;

      this.serverContext.removeUserContext(username);
      const groups: string[] | undefined = userContext.groups;

      /**
       * if user is part of any group then mark him/her inactive from that group
       */
      if (groups && groups.length > 0) {
        groups.forEach((groupName) => {
          this.serverContext.removeUserFromGroup(
            webSocket.id!,
            username,
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
    this.serverContext
      .getConnections()
      .forEach((socketConnection, connectionId) => {
        try {
          socketConnection.send(JSON.stringify(message));
        } catch (e) {
          this.logger.error(
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
      process.send!(JSON.stringify(ipcMessage));
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
        if (cluster.worker && !this.serverContext.hasUserContext(recipient)) {
          message.to = recipient;
          const ipcMessage: IPCMessage = {
            message,
            type: IPCMessageType.USER_MESSAGE,
          };

          /**
           * @TODO verify if stringify is really necessary
           */
          process.send!(JSON.stringify(ipcMessage));
        } else {
          this.serverContext
            .getUserConnections(recipient)
            .forEach((webSocket) => webSocket.send(JSON.stringify(message)));
        }
      });
    } else {
      // send message to single recipient
      this.serverContext
        .getUserConnections(message.to)
        .forEach((webSocket) => webSocket.send(JSON.stringify(message)));
    }
  }

  /**
   * handle websocket client disconnect
   * @param webSocket
   */
  async handleClientDisconnect(
    webSocket: CustomWebSocket,
    username: string
  ): Promise<void> {
    await this.handleClientDeRegister(
      {
        from: username,
        to: ServerConstants.THE_INSTASHARE_SERVER,
        type: SignalingMessageType.DEREGISTER,
      },
      webSocket
    );
    this.serverContext.removeClientConnection(webSocket);
  }

  /**
   * handle error on websocket connection
   * @param error
   * @param webSocket
   */
  async handleClientError(
    error: Error,
    webSocket: CustomWebSocket,
    username: string
  ): Promise<void> {
    await this.handleClientDeRegister(
      {
        from: username,
        to: ServerConstants.THE_INSTASHARE_SERVER,
        type: SignalingMessageType.DEREGISTER,
      },
      webSocket
    );
    this.serverContext.removeClientConnection(webSocket);
  }
}
