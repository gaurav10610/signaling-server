import { inject, singleton } from "tsyringe";
import { BaseSignalingServerException } from "../../exception/ApiExceptionHandler";
import { SimpleLogger } from "../../logging/SimpleLogger";
import { BaseSuccessResponse } from "../../types/api/api-response";
import { ClientConnection, ServerContext, UserContext } from "../../types/context";
import { IPCMessage, IPCMessageType } from "../../types/message";
import { CommunicationService } from "../communication-spec";
import { PrimaryUserService } from "./../user-spec";

@singleton()
export class PrimaryUserServiceImpl implements PrimaryUserService {
  constructor(
    @inject("logger") private logger: SimpleLogger,
    @inject("serverContext") private serverContext: ServerContext,
    @inject("communicationService")
    private communicationService: CommunicationService
  ) {
    this.logger.info(`primary user service instantiated!`);
  }

  /**
   * handle user register on signaling server
   * @param username username of the registering user
   * @param connectionId unique connection id of client
   *
   * @returns BaseSuccessResponse
   */
  async handleUserRegister(username: string, connectionId: string): Promise<BaseSuccessResponse> {
    if (this.serverContext.hasUserContext(username)) {
      throw new BaseSignalingServerException(400, "username already taken");
    }
    if (!this.serverContext.hasClientConnection(connectionId)) {
      throw new BaseSignalingServerException(400, "invalid client connection id");
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
     * keep client connect id -> username mapping to make search faster
     * in case of user disconnect
     **/
    clientConnection.username = username;

    /**
     * store user context on primary server
     */
    this.serverContext.storeUserContext(username, userContext);
    return {
      username,
      success: true,
    };
  }

  async handleUserDeRegister(username: string, connectionId: string): Promise<BaseSuccessResponse> {
    throw new Error("Method not implemented.");
  }

  async handleGroupRegister(username: string, groupName: string): Promise<BaseSuccessResponse> {
    throw new Error("Method not implemented.");
  }

  async handleGroupDeRegister(username: string, groupName: string): Promise<BaseSuccessResponse> {
    throw new Error("Method not implemented.");
  }

  async handleClientDisconnect(webSocket: IPCMessage): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
