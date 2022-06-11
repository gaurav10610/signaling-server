import { BaseSignalingMessage } from "../types/message";
import { CustomWebSocket } from "../types/websocket";

export interface UserService {
  /**
   * handle message received from a client
   * @param jsonMessage
   * @param webSocket
   */
  handleClientMessage(
    jsonMessage: any,
    webSocket: CustomWebSocket
  ): Promise<void>;

  /**
   * handle user registeration on signaling server
   * @param message received message on server
   * @param webSocket websocket client connection
   */
  handleClientRegister(
    message: BaseSignalingMessage,
    webSocket: CustomWebSocket
  ): Promise<void>;

  /**
   * handle user de-regiter on signaling-server
   * @param message received message on server
   * @param webSocket websocket client connection
   */
  handleClientDeRegister(
    message: BaseSignalingMessage,
    webSocket: CustomWebSocket
  ): Promise<void>;

  /**
   * broadcast the specified message to all the clients
   * @param message message payload that needs to be sent
   */
  broadCastMessage(message: BaseSignalingMessage): Promise<void>;

  /**
   * send a message to appropriate user/users
   * @param message
   */
  sendSocketMessage(message: BaseSignalingMessage): Promise<void>;

  /**
   * handle websocket client disconnect
   * @param webSocket
   */
  handleClientDisconnect(
    webSocket: CustomWebSocket,
    username: string
  ): Promise<void>;

  /**
   * handle error on websocket connection
   * @param error
   * @param webSocket
   */
  handleClientError(
    error: Error,
    webSocket: CustomWebSocket,
    username: string
  ): Promise<void>;
}
