import { CommunicationService } from "./../../types/communication";
import {
  BaseSignalingMessage,
  RegisterAck,
  SignalingMessageType,
} from "../../types/message";
import { ServerContext, UserContext } from "../../types/context";
import { CustomWebSocket } from "../../types/websocket";
import { ServerConstants } from "../../utils/ServerConstants";
import { SimpleLogger } from "../../logging/logger-impl";
import { inject, singleton } from "tsyringe";
import { UserService } from "../user-spec";
import { GroupRegisterResponse } from "../../types/api/api-response";

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
   * handle group registeration
   * @param username
   * @param groupName
   */
  async handleGroupRegister(
    username: string,
    groupName: string
  ): Promise<GroupRegisterResponse> {
    this.serverContext.addUserInGroup(username, groupName);
    const response: GroupRegisterResponse = {
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
  ): Promise<GroupRegisterResponse> {
    this.serverContext.removeUserFromGroup(username, groupName);
    const response: GroupRegisterResponse = {
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
