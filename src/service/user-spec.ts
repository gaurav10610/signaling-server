import { GroupRegisterRequest } from "../types/api/api-request";
import { GroupRegisterResponse } from "../types/api/api-response";
import { BaseSignalingMessage, GroupRegisterMessage } from "../types/message";
import { CustomWebSocket } from "../types/websocket";

export interface UserService {
  handleClientRegister(
    message: BaseSignalingMessage,
    webSocket: CustomWebSocket
  ): Promise<void>;

  handleClientDeRegister(
    message: BaseSignalingMessage,
    webSocket: CustomWebSocket
  ): Promise<void>;

  handleGroupRegister(
    username: string,
    groupName: string
  ): Promise<GroupRegisterResponse>;

  handleGroupDeRegister(
    username: string,
    groupName: string
  ): Promise<GroupRegisterResponse>;

  handleClientDisconnect(
    webSocket: CustomWebSocket,
    username: string
  ): Promise<void>;

  handleClientError(
    error: Error,
    webSocket: CustomWebSocket,
    username: string
  ): Promise<void>;
}
