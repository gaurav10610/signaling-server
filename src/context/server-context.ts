import {
  GroupContext,
  GroupUser,
  ServerContext,
  UserContext,
} from "../types/user-context";
import { CustomWebSocket } from "../types/websocket";
import { CommonUtils } from "../utils/common-utils";

export class InMemoryServerContext implements ServerContext {
  /**
   * stores user context in following manner
   *
   * username -> { ...UserContext }
   *
   */
  private userContext: Map<string, UserContext>;

  /**
   * stores group context in following manner
   *
   * groupName -> { ...GroupContext }
   *
   */
  private groupContext: Map<string, GroupContext>;

  /**
   * stores websocket client connections in following manner
   *
   * websocketId -> webSocketConnection
   *
   */
  private clientConnections: Map<string, CustomWebSocket>;

  constructor() {
    this.userContext = new Map<string, UserContext>();
    this.groupContext = new Map<string, GroupContext>();
    this.clientConnections = new Map<string, CustomWebSocket>();
  }

  /**
   * removes the user context for the user with specied user name
   * @param username
   */
  removeUserContext(username: string): void {
    this.userContext.delete(username);
  }

  /**
   * saves the user context for the user with specied user name
   * @param username
   * @param userContext
   */
  setUserContext(username: string, userContext: UserContext): void {
    this.userContext.set(username, userContext);
  }

  /**
   * check whether group context exist for the user with specified user name
   * @param username
   * @returns
   */
  hasUserContext(username: string): boolean {
    return this.userContext.has(username);
  }

  /**
   * get user context for the specified username
   * @param username
   * @returns
   */
  getUserContext(username: string): UserContext | undefined {
    return this.userContext.get(username);
  }

  /**
   * check whether group context exist for specified group name
   * @param groupName
   * @returns
   */
  hasGroupContext(groupName: string): boolean {
    return this.groupContext.has(groupName);
  }

  /**
   * get the group context for the group with specified group name
   * @param groupName
   * @returns
   */
  getGroupContext(groupName: string): GroupContext | undefined {
    return this.groupContext.get(groupName);
  }

  /**
   * saves the specified group context with the specied group name
   * @param groupName
   * @param groupContext
   */
  setGroupContext(groupName: string, groupContext: GroupContext): void {
    this.groupContext.set(groupName, groupContext);
  }

  /**
   * removes the group context of the group with specified name
   * @param groupName
   */
  removeGroupContext(groupName: string): void {
    this.groupContext.delete(groupName);
  }

  /**
   * add the specified user in the specified group
   * @param webSocketId
   * @param username
   * @param groupName
   */
  async addUserInGroup(
    webSocketId: string,
    username: string,
    groupName: string
  ): Promise<void> {
    if (this.groupContext.has(groupName)) {
      const groupContext: GroupContext = this.groupContext.get(groupName)!;

      /**
       * if user is not part of the specified group then add a new group user
       */
      if (!groupContext.users.has(webSocketId)) {
        groupContext.users.set(webSocketId, {
          joinedAt: new Date(),
          username,
          isActive: true,
        });
      }
    }
    throw Error(`${groupName} group does not exist!`);
  }

  /**
   * removes the specified user from the specifed group
   * @param webSocketId
   * @param username
   * @param groupName
   */
  async removeUserFromGroup(
    webSocketId: string,
    username: string,
    groupName: string
  ): Promise<void> {
    if (this.groupContext.has(groupName)) {
      const groupContext: GroupContext = this.groupContext.get(groupName)!;

      const groupUser: GroupUser | undefined =
        groupContext.users.get(webSocketId);

      /**
       * check if group user exist then mark him/her as in-active
       */
      if (groupUser && groupUser.username === username) {
        groupUser.leftAt = new Date();
        groupUser.isActive = false;
      }
    }
  }

  /**
   * get a list of all the websocket connections of the specified users
   *
   * @param username
   * @returns
   */
  getUserConnections(username: string): CustomWebSocket[] | undefined {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.userContext
      .get(username)
      .connectionIds.map((connectionId) =>
        this.clientConnections.get(connectionId)
      );
  }

  /**
   * assign a unique id to websocket connection & keep a mapping in clientConnection context
   * @param webSocket
   */
  setClientConnection(webSocket: CustomWebSocket): void {
    webSocket.id = CommonUtils.generateUniqueId();
    global.logger.info(
      `new client connected with connection id: ${webSocket.id}`
    );
    this.clientConnections.set(webSocket.id, webSocket);
  }

  /**
   * remove the client mapping from client connection context
   * @param webSocket
   */
  removeClientConnection(webSocket: CustomWebSocket): void {
    if (webSocket.id) {
      global.logger.info(
        `client connection with connection id: ${webSocket.id} has been removed from context`
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
