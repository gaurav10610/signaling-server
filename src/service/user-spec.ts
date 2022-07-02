import { BaseSuccessResponse } from "./../types/api/api-response";
import { BaseSignalingMessage } from "../types/message";
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

  handleUserRegister(
    username: string,
    connectionId: string
  ): Promise<BaseSuccessResponse>;

  handleUserDeRegister(
    username: string,
    connectionId: string
  ): Promise<BaseSuccessResponse>;

  handleGroupRegister(
    username: string,
    groupName: string
  ): Promise<BaseSuccessResponse>;

  handleGroupDeRegister(
    username: string,
    groupName: string
  ): Promise<BaseSuccessResponse>;

  handleClientDisconnect(webSocket: CustomWebSocket): Promise<void>;

  handleClientError(error: Error, webSocket: CustomWebSocket): Promise<void>;
}
