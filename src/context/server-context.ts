import {
  GroupContext,
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

  getUserContext(username: string): UserContext | undefined {
    return this.userContext.get(username);
  }

  getUserConnection(username: string): CustomWebSocket[] | undefined {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.userContext
      .get(username)
      ?.connectionIds.map((connectionId) =>
        this.clientConnections.get(connectionId)
      );
  }

  getGroupContext(groupName: string): GroupContext | undefined {
    return this.groupContext.get(groupName);
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
}
