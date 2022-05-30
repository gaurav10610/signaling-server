import { WebSocket } from "ws";
import { CustomWebSocket } from "./websocket";

export interface UserContext {
  username: string;
  connectionIds: string[]; // unique ids of connections
  groups?: string[];
  connectedAt: Date;
}

export interface GroupContext {
  id: string;
  groupName: string;
  users: Map<string, GroupUser>; // websocketId -> { ...groupUser}
  createAt: Date;
  deletedAt?: Date;
}

export interface GroupUser {
  username: string;
  joinedAt: Date;
  leftAt?: Date;
  isActive: boolean;
}

export interface ServerContext {
  hasUserContext(username: string): boolean;
  getUserContext(username: string): UserContext | undefined;
  setUserContext(username: string, userContext: UserContext): void;
  removeUserContext(username: string): void;
  hasGroupContext(groupName: string): boolean;
  getGroupContext(groupName: string): GroupContext | undefined;
  setGroupContext(groupName: string, groupContext: GroupContext): void;
  removeGroupContext(groupName: string): void;
  addUserInGroup(
    webSocketId: string,
    username: string,
    groupName: string
  ): Promise<void>;
  removeUserFromGroup(
    webSocketId: string,
    username: string,
    groupName: string
  ): void;
  getUserConnections(username: string): CustomWebSocket[] | undefined;
  setClientConnection(webSocket: CustomWebSocket): void;
  removeClientConnection(webSocket: CustomWebSocket): void;
  getConnections(): Map<string, CustomWebSocket>;
}
