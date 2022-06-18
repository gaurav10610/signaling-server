import { CustomWebSocket } from "./websocket";

export interface UserContext {
  username: string;
  connectionIds: string[]; // unique ids of connections
  groups?: string[];
  connectedAt: Date;
  serverId?: number; // used by primary process only
}

export interface GroupContext {
  id: string;
  groupName: string;
  users: Map<string, GroupUserContext>; // username -> { ...groupUserContext}
  createAt: Date;
  deletedAt?: Date;
}

export interface GroupUserContext {
  joinedAt: Date;
}

export interface ServerContext {
  hasUserContext(username: string): boolean;
  getAllActiveUsers(): Map<string, UserContext>;
  getUserContext(username: string): UserContext | undefined;
  storeUserContext(username: string, userContext: UserContext): void;
  removeUserContext(username: string): void;
  hasGroupContext(groupName: string): boolean;
  getAllActiveGroupUsers(): Map<string, GroupContext>;
  getGroupContext(groupName: string): GroupContext | undefined;
  storeGroupContext(groupName: string, groupContext: GroupContext): void;
  removeGroupContext(groupName: string): void;
  addUserInGroup(username: string, groupName: string): void;
  removeUserFromGroup(username: string, groupName: string): void;
  getUserConnections(username: string): CustomWebSocket[];
  storeClientConnection(webSocket: CustomWebSocket): void;
  removeClientConnection(webSocket: CustomWebSocket): void;
  getConnections(): Map<string, CustomWebSocket>;
}
