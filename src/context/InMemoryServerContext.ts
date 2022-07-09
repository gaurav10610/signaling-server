import { CommonUtils } from "./../utils/CommonUtils";
import { Worker } from "cluster";
import { inject, singleton } from "tsyringe";
import { BaseSignalingServerException } from "../exception/ApiExceptionHandler";
import { SimpleLogger } from "../logging/SimpleLogger";
import { ClientConnection, GroupContext, ServerContext, UserContext } from "../types/context";
import { CustomWebSocket } from "../types/websocket";

@singleton()
export class InMemoryServerContext implements ServerContext {
  /**
   * stores user context in following manner
   *
   * username -> { ...UserContext }
   *
   */
  private usersContext: Map<string, UserContext>;

  /**
   * stores group context in following manner
   *
   * groupName -> { ...GroupContext }
   *
   */
  private groupsContext: Map<string, GroupContext>;

  /**
   * stores websocket client connections in following manner
   *
   * websocketId -> ClientConnection
   *
   */
  private clientConnections: Map<string, ClientConnection>;

  /**
   * stores the instances of worker processes
   *
   * serverId -> worker instance
   *
   * @usage - this will be used by primary process only
   */
  private workers: Map<number, Worker>;

  /**
   * server id of the worker server
   *
   * @usage - this will be used by worker servers only
   */
  private serverId: number | undefined;

  constructor(@inject("logger") private logger: SimpleLogger) {
    this.usersContext = new Map<string, UserContext>();
    this.groupsContext = new Map<string, GroupContext>();
    this.clientConnections = new Map<string, ClientConnection>();
    this.workers = new Map<number, Worker>();
  }

  getAllActiveUsers(): Map<string, UserContext> {
    return this.usersContext;
  }

  /**
   * removes the user context for the user with specied user name
   * @param username
   */
  removeUserContext(username: string): void {
    this.logger.info(`user with username ${username} has been removed from context`);
    this.usersContext.delete(username);
  }

  /**
   * saves the user context for the user with specied user name
   *
   * example -
   *
   * {
   *   username1 -> { ...UserContext },
   *   username2 -> { ...UserContext }
   * }
   *
   * @param username
   * @param userContext
   */
  storeUserContext(username: string, userContext: UserContext): void {
    this.usersContext.set(username, userContext);
  }

  /**
   * check whether group context exist for the user with specified user name
   * @param username
   * @returns
   */
  hasUserContext(username: string): boolean {
    return this.usersContext.has(username);
  }

  /**
   * get user context for the specified username
   * @param username
   * @returns
   */
  getUserContext(username: string): UserContext | undefined {
    return this.usersContext.get(username);
  }

  /**
   * check whether group context exist for specified group name
   * @param groupName
   * @returns
   */
  hasGroupContext(groupName: string): boolean {
    return this.groupsContext.has(groupName);
  }

  /**
   * get all the active groups along with users
   */
  getAllActiveGroupUsers(): Map<string, GroupContext> {
    return this.groupsContext;
  }

  /**
   * get the group context for the group with specified group name
   * @param groupName
   * @returns
   */
  getGroupContext(groupName: string): GroupContext | undefined {
    return this.groupsContext.get(groupName);
  }

  /**
   * saves the specified group context with the specied group name
   *
   * example -
   *
   * {
   *   groupName1 -> { ...GroupContext },
   *   groupName2 -> { ...GroupContext }
   * }
   *
   * @param groupName
   * @param groupContext
   */
  storeGroupContext(groupName: string, groupContext: GroupContext): void {
    this.logger.info(`added group context of group with name: ${groupName}`);
    this.groupsContext.set(groupName, groupContext);
  }

  /**
   * removes the group context of the group with specified name
   * @param groupName
   */
  removeGroupContext(groupName: string): void {
    this.logger.info(`removed group context of group with name: ${groupName}`);
    this.groupsContext.delete(groupName);
  }

  /**
   * add the specified user in the specified group
   * @param username
   * @param groupName
   */
  addUserInGroup(username: string, groupName: string): void {
    if (!this.hasUserContext(username)) {
      throw new BaseSignalingServerException(404, "user does not exist");
    }
    if (!this.hasGroupContext(groupName)) {
      throw new BaseSignalingServerException(404, "group does not exist");
    }

    const groupContext: GroupContext = this.getGroupContext(groupName)!;
    if (groupContext.users.has(username)) {
      throw new BaseSignalingServerException(400, "user with same name already exist in group");
    }
    groupContext.users.set(username, {
      joinedAt: new Date(),
    });

    const userContext: UserContext = this.getUserContext(username)!;
    /**
     * initialize group array if not already initialized
     */
    if (!userContext.groups) {
      userContext.groups = [];
    }

    /**
     * check if user is already part of the group or not
     */
    if (!userContext.groups.includes(groupName)) {
      userContext.groups.push(groupName);
    }
  }

  /**
   * removes the specified user from the specifed group
   * @param username
   * @param groupName
   */
  removeUserFromGroup(username: string, groupName: string): void {
    if (!this.hasUserContext(username)) {
      throw new BaseSignalingServerException(404, "user does not exist");
    }
    if (!this.hasGroupContext(groupName)) {
      throw new BaseSignalingServerException(404, "group does not exist");
    }

    /**
     * remove group name from user groups
     */
    const userContext: UserContext = this.getUserContext(username)!;
    if (userContext.groups && userContext.groups.includes(groupName)) {
      CommonUtils.removeArrayElement(userContext.groups, groupName);
    }

    /**
     * remove user from group context
     */
    const groupContext: GroupContext = this.getGroupContext(groupName)!;
    if (!groupContext.users.has(username)) {
      return;
    }
    groupContext.users.delete(username);
  }

  /**
   * get a list of all the websocket connections of the specified users
   * @param username registered username of the user
   * @returns
   */
  getUserConnections(username: string): CustomWebSocket[] {
    const connections: CustomWebSocket[] = [];
    if (this.hasUserContext(username)) {
      this.usersContext
        .get(username)!
        .connectionIds.map((connectionId) => this.clientConnections.get(connectionId))
        .filter((clientConnection) => clientConnection !== undefined)
        .map((clientConnection) => clientConnection!.webSocket!)
        .forEach((webSocket) => connections.push(webSocket));
    }
    return connections;
  }

  /**
   * check whether client connection exist or not
   * @param connectionId
   */
  hasClientConnection(connectionId: string): boolean {
    return this.clientConnections.has(connectionId);
  }

  /**
   * keep a mapping in clientConnection context
   * @param connectionId websocket connection identifier
   * @param clientConnection client connection instance
   */
  storeClientConnection(connectionId: string, clientConnection: ClientConnection): void {
    this.clientConnections.set(connectionId, clientConnection);
  }

  /**
   * remove the client mapping from client connection context
   * @param connectionId websocket connection identifier
   */
  removeClientConnection(connectionId: string): void {
    this.clientConnections.delete(connectionId);
  }

  /**
   * get client connection
   * @param connectionId websocket connection identifier
   */
  getClientConnection(connectionId: string): ClientConnection | undefined {
    return this.clientConnections.get(connectionId);
  }

  /**
   * update client connection's username
   * @param connectionId websocket connection identifier
   * @param username username of the user who owns the connection with specied connection id
   */
  updateClientUsername(connectionId: string, username: string): void {
    if (!this.clientConnections.has(connectionId)) {
      throw new BaseSignalingServerException(404, "connection id not found");
    }
    this.getClientConnection(connectionId)!.username = username;
  }

  /**
   * get all client connections
   *
   * example -
   * {
   *   websocketId1 -> webSocketConnection,
   *   websocketId2 -> webSocketConnection
   * }
   *
   * @returns
   */
  getAllConnections(): Map<string, ClientConnection> {
    return this.clientConnections;
  }

  getServerId(): number | undefined {
    return this.serverId;
  }

  setServerId(serverId: number): void {
    this.serverId = serverId;
  }

  setWorker(serverId: number, worker: Worker): void {
    this.workers.set(serverId, worker);
  }

  getWorker(serverId: number): Worker | undefined {
    return this.workers.get(serverId);
  }

  getAllWorkers(): Map<number, Worker> {
    return this.workers;
  }
}
