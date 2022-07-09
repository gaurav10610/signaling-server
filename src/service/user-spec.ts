import { GroupInfo, IPCMessage } from "./../types/message";
import { BaseSuccessResponse } from "./../types/api/api-response";
import { CustomWebSocket } from "../types/websocket";
import { UserContext } from "../types/context";

export interface BaseUserService {}

export interface WorkerUserService extends BaseUserService {
  handleUserRegister(userContext: UserContext): Promise<void>;
  handleUserDeRegister(userContext: UserContext): Promise<void>;
  handleGroupRegister(groupInfo: GroupInfo): Promise<void>;
  handleGroupDeRegister(groupInfo: GroupInfo): Promise<void>;
  handleClientDisconnect(webSocket: CustomWebSocket): Promise<void>;
  handleClientError(error: Error, webSocket: CustomWebSocket): Promise<void>;
}

export interface PrimaryUserService extends BaseUserService {
  handleUserConnectionStatus(message: IPCMessage): Promise<void>;
  handleUserRegister(username: string, connectionId: string): Promise<BaseSuccessResponse>;
  handleUserDeRegister(username: string, connectionId: string): Promise<BaseSuccessResponse>;
  handleGroupRegister(username: string, groupName: string): Promise<BaseSuccessResponse>;
  handleGroupDeRegister(username: string, groupName: string): Promise<BaseSuccessResponse>;
}
