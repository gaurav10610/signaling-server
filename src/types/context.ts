import { Worker } from "cluster";
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

export interface ClientConnection {
  serverId: number;
  webSocket?: CustomWebSocket;
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
  storeClientConnection(
    connectionId: string,
    clientConnection: ClientConnection
  ): void;
  removeClientConnection(connectionId: string): void;
  getAllConnections(): Map<string, ClientConnection>;
  getServerId(): number | undefined;
  setServerId(serverId: number): void;
  setWorker(serverId: number, worker: Worker): void;
  getWorker(serverId: number): Worker | undefined;
  getAllWorkers(): Map<number, Worker>;
}
