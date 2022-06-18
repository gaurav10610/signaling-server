import { inject, singleton } from "tsyringe";
import { BaseSignalingServerException } from "../exception/handler";
import { SimpleLogger } from "../logging/logger-impl";
import {
  GroupContext,
  GroupUserContext,
  ServerContext,
  UserContext,
} from "../types/context";
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
   * websocketId -> webSocketConnection
   *
   */
  private clientConnections: Map<string, CustomWebSocket>;

  constructor(@inject("logger") private logger: SimpleLogger) {
    this.usersContext = new Map<string, UserContext>();
    this.groupsContext = new Map<string, GroupContext>();
    this.clientConnections = new Map<string, CustomWebSocket>();
  }

  getAllActiveUsers(): Map<string, UserContext> {
    return this.usersContext;
  }

  /**
   * removes the user context for the user with specied user name
   * @param username
   */
  removeUserContext(username: string): void {
    this.logger.info(
      `user with username ${username} has been removed from context`
    );
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
    if (!this.hasGroupContext(groupName)) {
      throw new BaseSignalingServerException(400, "group does not exist");
    }
    const groupContext: GroupContext = this.getGroupContext(groupName)!;
    if (groupContext.users.has(username)) {
      throw new BaseSignalingServerException(
        400,
        "user with same name already exist in group"
      );
    }
    groupContext.users.set(username, {
      joinedAt: new Date(),
    });
  }

  /**
   * removes the specified user from the specifed group
   * @param username
   * @param groupName
   */
  removeUserFromGroup(username: string, groupName: string): void {
    if (!this.hasGroupContext(groupName)) {
      throw new BaseSignalingServerException(400, "group does not exist");
    }
    const groupContext: GroupContext = this.getGroupContext(groupName)!;
    if (!groupContext.users.has(username)) {
      throw new BaseSignalingServerException(
        400,
        "user does not exist in group"
      );
    }
    groupContext.users.delete(username);
  }

  /**
   * get a list of all the websocket connections of the specified users
   * @param username
   * @returns
   */
  getUserConnections(username: string): CustomWebSocket[] {
    const connections: CustomWebSocket[] = [];
    const userContext: UserContext | undefined =
      this.usersContext.get(username);
    if (userContext) {
      userContext.connectionIds
        .filter((connectionId) => this.clientConnections.has(connectionId))
        .map((connectionId) => this.clientConnections.get(connectionId))
        .forEach((webSocket) => connections.push(webSocket!));
    }
    return connections;
  }

  /**
   * assign a unique id to websocket connection & keep a mapping in clientConnection context
   * @param webSocket
   */
  storeClientConnection(webSocket: CustomWebSocket): void {
    this.logger.info(
      `new client connected with connection id: ${webSocket.id}`
    );
    this.clientConnections.set(webSocket.id!, webSocket);
  }

  /**
   * remove the client mapping from client connection context
   * @param webSocket
   */
  removeClientConnection(webSocket: CustomWebSocket): void {
    if (webSocket.id) {
      this.logger.info(
        `connection with id: ${webSocket.id} has been removed from context`
      );
      this.clientConnections.delete(webSocket.id);
    }
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
  getConnections(): Map<string, CustomWebSocket> {
    return this.clientConnections;
  }
}
