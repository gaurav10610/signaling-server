import { ClientConnection } from "../../types/context";
import { BaseSignalingServerException } from "../../exception/ApiExceptionHandler";
import { BaseSuccessResponse } from "../../types/api/api-response";
import { CommunicationService } from "../communication-spec";
import {
  BaseSignalingMessage,
  ClientConnectionStatus,
  IPCMessageType,
  RegisterAck,
  SignalingMessageType,
} from "../../types/message";
import { ServerContext, UserContext } from "../../types/context";
import { CustomWebSocket } from "../../types/websocket";
import { ServerConstants } from "../../utils/ServerConstants";
import { SimpleLogger } from "../../logging/SimpleLogger";
import { inject, singleton } from "tsyringe";
import { UserService } from "../user-spec";

@singleton()
export class UserServiceImpl implements UserService {
  constructor(
    @inject("logger") private logger: SimpleLogger,
    @inject("serverContext") private serverContext: ServerContext,
    @inject("communicationService")
    private communicationService: CommunicationService
  ) {
    this.logger.info(`websocket helper initialiazed!`);
  }

  /**
   * handle user register on signaling server
   * @param username
   * @param connectionId
   */
  async handleUserRegister(
    username: string,
    connectionId: string
  ): Promise<BaseSuccessResponse> {
    if (this.serverContext.hasUserContext(username)) {
      throw new BaseSignalingServerException(400, "username already taken");
    }
    if (!this.serverContext.hasClientConnection(connectionId)) {
      throw new BaseSignalingServerException(
        400,
        "invalid client connection id"
      );
    }

    /**
     * fetch client connection details to know server id
     */
    const clientConnection: ClientConnection =
      this.serverContext.getClientConnection(connectionId)!;

    /**
     * prepare user context
     */
    const userContext: UserContext = {
      username,
      connectionIds: [connectionId],
      serverId: clientConnection.serverId,
      connectedAt: new Date(),
    };

    /**
     * update the worker server about user registeration using server id
     */
    this.communicationService.sendWorkerMessage(clientConnection.serverId, {
      type: IPCMessageType.USER_REGISTER,
      serverId: clientConnection.serverId,
      message: userContext,
    });

    /**
     * store user context on primary server
     */
    this.serverContext.storeUserContext(username, userContext);

    const response: BaseSuccessResponse = {
      username,
      success: false,
    };
    return response;
  }

  /**
   * handle user de-register on signaling server
   * @param username
   * @param connectionId
   */
  async handleUserDeRegister(
    username: string,
    connectionId: string
  ): Promise<BaseSuccessResponse> {
    throw new Error("Method not implemented.");
  }

  /**
   * handle group registeration
   * @param username
   * @param groupName
   */
  async handleGroupRegister(
    username: string,
    groupName: string
  ): Promise<BaseSuccessResponse> {
    this.serverContext.addUserInGroup(username, groupName);
    const response: BaseSuccessResponse = {
      username,
      success: true,
    };
    return response;
  }

  /**
   * handle user de-register from a group
   * @param username
   * @param groupName
   */
  async handleGroupDeRegister(
    username: string,
    groupName: string
  ): Promise<BaseSuccessResponse> {
    this.serverContext.removeUserFromGroup(username, groupName);
    const response: BaseSuccessResponse = {
      username,
      success: true,
    };
    return response;
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
      this.communicationService.sendSocketMessage(registerAck);
      return;
    }

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
    this.communicationService.sendSocketMessage(registerAck);
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
    }
  }

  /**
   * handle websocket client disconnect
   * @param webSocket
   */
  async handleClientDisconnect(webSocket: CustomWebSocket): Promise<void> {
    this.logger.info(`websocket connection closed with id: ${webSocket.id}`);
    this.serverContext.removeClientConnection(webSocket.id!);

    const connectionStatus: ClientConnectionStatus = {
      connected: false,
      connectionId: webSocket.id!,
      serverId: this.serverContext.getServerId()!,
    };

    // update the primary process about the new client connection
    this.communicationService.sendPrimaryServerMessage({
      type: IPCMessageType.CONNECTION_STATUS,
      serverId: this.serverContext.getServerId()!,
      message: connectionStatus,
    });
  }

  /**
   * handle error on websocket connection
   * @param error
   * @param webSocket
   */
  async handleClientError(
    error: Error,
    webSocket: CustomWebSocket
  ): Promise<void> {
    this.logger.error(
      `error occured on client connection with id: ${webSocket.id}`
    );
  }
}
