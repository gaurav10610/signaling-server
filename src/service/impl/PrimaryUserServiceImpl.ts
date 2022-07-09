import { CommunicationServiceImpl } from "./CommunicationServiceImpl";
import { inject, singleton } from "tsyringe";
import { InMemoryServerContext } from "../../context/InMemoryServerContext";
import { BaseSignalingServerException } from "../../exception/ApiExceptionHandler";
import { SimpleLogger } from "../../logging/SimpleLogger";
import { BaseSuccessResponse } from "../../types/api/api-response";
import { ClientConnection, UserContext } from "../../types/context";
import { ClientConnectionStatus, IPCMessage, IPCMessageType } from "../../types/message";
import { PrimaryUserService } from "./../user-spec";

@singleton()
export class PrimaryUserServiceImpl implements PrimaryUserService {
  constructor(
    @inject("logger") private logger: SimpleLogger,
    @inject("serverContext") private serverContext: InMemoryServerContext,
    @inject("communicationService")
    private communicationService: CommunicationServiceImpl
  ) {
    this.logger.info(`primary user service instantiated!`);
  }

  /**
   * handle connection status message from worker server
   * @param message ipc message from worker
   */
  async handleUserConnectionStatus(message: IPCMessage): Promise<void> {
    const { connectionId, connected, serverId } = message.message as ClientConnectionStatus;

    /**
     * when user got connected with web socket server,
     * then just store the connection mapping in server context
     */
    if (connected) {
      this.serverContext.storeClientConnection(connectionId, {
        serverId,
      });
      return;
    }

    /**
     * when user got disconnected from server, then check if user was
     * a registered user and then do the cleanup accordingly
     */
    const clientConnection: ClientConnection | undefined = this.serverContext.getClientConnection(connectionId);
    if (clientConnection) {
      const { username } = clientConnection;
      if (username && this.serverContext.hasUserContext(username)) {
        const { groups } = this.serverContext.getUserContext(username)!;

        /**
         * remove user from all the groups that he is part of
         */
        if (groups && groups.length > 0) {
          groups
            .filter((groupName) => this.serverContext.hasGroupContext(groupName))
            .map((groupName) => this.serverContext.getGroupContext(groupName)!)
            .forEach((groupContext) => {
              groupContext.users.delete(clientConnection.username!);
            });
        }
        this.serverContext.removeUserContext(username);
      }
      this.serverContext.removeClientConnection(connectionId);
    }
  }

  /**
   * handle user register on signaling server
   * @param username username of the registering user
   * @param connectionId unique connection id of client
   *
   * @returns @BaseSuccessResponse
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
    const clientConnection: ClientConnection = this.serverContext.getClientConnection(connectionId)!;

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

  /**
   * handle user de-register from signaling server
   * @param username username of the registering user
   * @param connectionId unique connection id of client
   *
   * @returns @BaseSuccessResponse
   */
  async handleUserDeRegister(username: string, connectionId: string): Promise<BaseSuccessResponse> {
    const userContext: UserContext | undefined = this.serverContext.getUserContext(username);

    /**
     * if user context exist then update corresponding worker server about de-register and remove
     * user from all the groups that he is part of
     */
    if (userContext) {
      this.communicationService.sendWorkerMessage(userContext.serverId!, {
        type: IPCMessageType.USER_DEREGISTER,
        serverId: userContext.serverId!,
        message: {
          ...userContext,
        },
      });

      if (userContext.groups) {
        userContext.groups.forEach((groupName) => {});
      }
    }

    return {
      username,
      success: true,
    };
  }

  async handleGroupRegister(username: string, groupName: string): Promise<BaseSuccessResponse> {
    throw new Error("Method not implemented.");
  }

  async handleGroupDeRegister(username: string, groupName: string): Promise<BaseSuccessResponse> {
    throw new Error("Method not implemented.");
  }
}
