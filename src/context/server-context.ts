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

  removeUserContext(username: string): void {
    this.userContext.delete(username);
  }

  setUserContext(username: string, userContext: UserContext): void {
    this.userContext.set(username, userContext);
  }

  hasUserContext(username: string): boolean {
    return this.userContext.has(username);
  }

  getUserContext(username: string): UserContext | undefined {
    return this.userContext.get(username);
  }

  hasGroupContext(groupName: string): boolean {
    return this.groupContext.has(groupName);
  }

  getGroupContext(groupName: string): GroupContext | undefined {
    return this.groupContext.get(groupName);
  }

  setGroupContext(groupName: string, groupContext: GroupContext): void {
    this.groupContext.set(groupName, groupContext);
  }

  removeGroupContext(groupName: string): void {
    this.groupContext.delete(groupName);
  }

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

  getUserConnections(username: string): CustomWebSocket[] | undefined {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.userContext
      .get(username)
      .connectionIds.map((connectionId) =>
        this.clientConnections.get(connectionId)
      );
  }

  setClientConnection(webSocket: CustomWebSocket): void {
    webSocket.id = CommonUtils.generateUniqueId();
    global.logger.info(
      `new client connected with connection id: ${webSocket.id}`
    );
    this.clientConnections.set(webSocket.id, webSocket);
  }

  removeClientConnection(webSocket: CustomWebSocket): void {
    global.logger.info(
      `client connection with connection id: ${webSocket.id} has been removed from context`
    );
    if (webSocket.id) {
      this.clientConnections.delete(webSocket.id);
    }
  }

  getConnections(): Map<string, CustomWebSocket> {
      return this.clientConnections;
  }
}
