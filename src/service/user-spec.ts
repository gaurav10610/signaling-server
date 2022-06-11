import { BaseSignalingMessage } from "../types/message";
import { CustomWebSocket } from "../types/websocket";

export interface UserService {
  handleClientMessage(
    jsonMessage: any,
    webSocket: CustomWebSocket
  ): Promise<void>;

  handleClientRegister(
    message: BaseSignalingMessage,
    webSocket: CustomWebSocket
  ): Promise<void>;

  handleClientDeRegister(
    message: BaseSignalingMessage,
    webSocket: CustomWebSocket
  ): Promise<void>;

  broadCastMessage(message: BaseSignalingMessage): Promise<void>;

  sendSocketMessage(message: BaseSignalingMessage): Promise<void>;

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
