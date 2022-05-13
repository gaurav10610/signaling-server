import { WebSocket } from "ws";

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
  getUserContext(username: string): UserContext | undefined;
  getUserConnection(username: string): WebSocket[] | undefined;
  getGroupContext(groupName: string): GroupContext | undefined;
}
