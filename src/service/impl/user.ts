import { BaseSuccessResponse } from "./../../types/api/api-response";
import { CommunicationService } from "./../../types/communication";
import {
  BaseSignalingMessage,
  ClientConnectionStatus,
  IPCMessage,
  IPCMessageType,
  RegisterAck,
  SignalingMessageType,
} from "../../types/message";
import { ServerContext, UserContext } from "../../types/context";
import { CustomWebSocket } from "../../types/websocket";
import { ServerConstants } from "../../utils/ServerConstants";
import { SimpleLogger } from "../../logging/logger-impl";
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
   */
  handleUserRegister(username: string): Promise<BaseSuccessResponse> {
    throw new Error("Method not implemented.");
  }

  /**
   * handle user de-register on signaling server
   * @param username
   */
  handleUserDeRegister(username: string): Promise<BaseSuccessResponse> {
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
    // await this.handleClientDeRegister(
    //   {
    //     from: username,
    //     to: ServerConstants.THE_INSTASHARE_SERVER,
    //     type: SignalingMessageType.DEREGISTER,
    //   },
    //   webSocket
    // );
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
