import { WebSocket } from "ws";
import {
  GroupContext,
  ServerContext,
  UserContext,
} from "../types/user-context";

export class InMemoryServerContext implements ServerContext {
  private userContext: Map<string, UserContext>;
  private groupContext: Map<string, GroupContext>;
  private clientConnections: Map<string, WebSocket>;

  constructor() {
    this.userContext = new Map<string, UserContext>();
    this.groupContext = new Map<string, GroupContext>();
    this.clientConnections = new Map<string, WebSocket>();
  }

  getUserContext(username: string): UserContext | undefined {
    return this.userContext.get(username);
  }

  getUserConnection(username: string): WebSocket[] | undefined {
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
}
