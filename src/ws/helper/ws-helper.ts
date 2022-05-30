import { BaseSignalingMessage } from "../../types/message";
import { ServerContext, UserContext } from "../../types/user-context";
import { CustomWebSocket } from "../../types/websocket";

/**
 * handle user registeration on signaling server
 * @param message received message on server
 * @param webSocket websocket client connection
 */
exports.handleClientRegister = async (
  message: BaseSignalingMessage,
  webSocket: CustomWebSocket
) => {
  /**
   * check if the received username is unique using server context
   */
  if (global.serverContext.hasUserContext(message.from)) {
    throw Error(
      `there is already a user registered with username ${message.from}`
    );
  }

  /**
   * register the user on server and create a user context
   */
  const userContext: UserContext = {
    username: message.from,
    connectedAt: new Date(),
    connectionIds: [],
  };

  if (webSocket.id) {
    userContext.connectionIds.push(webSocket.id);
  }
  global.serverContext.setUserContext(message.from, userContext);
};

/**
 * handle user de-regiter on signaling-server
 * @param message received message on server
 * @param webSocket websocket client connection
 */
exports.handleClientDeRegister = async (
  message: BaseSignalingMessage,
  webSocket: CustomWebSocket
) => {
  if (global.serverContext.hasUserContext(message.from)) {
    const serverContext: ServerContext = global.serverContext;
    const userContext: UserContext = serverContext.getUserContext(
      message.from
    )!;

    /**
     * remove user's context
     */
    serverContext.removeUserContext(message.from);

    const groups: string[] | undefined = userContext.groups;

    /**
     * if user is part of any group then mark him/her inactive from that group
     */
    if (groups && groups.length > 0) {
      groups.forEach((groupName) => {
        serverContext.removeUserFromGroup(
          webSocket.id!,
          message.from,
          groupName
        );
      });
    }
  }
};

/**
 * broadcast the specified message to all the clients
 * @param message message payload that needs to be sent
 */
exports.broadCastMessage = async (message: BaseSignalingMessage) => {
  global.serverContext
    .getConnections()
    .forEach((socketConnection, connectionId) => {
      try {
        socketConnection.send(JSON.stringify(message));
      } catch (e) {
        global.logger.error(
          `unable to send broadcast message to: ${connectionId}`
        );
      }
    });

  /**
   * if server is running in cluster mode then send this message
   * to master process which will send this message to clients connected
   * to other server instances as well
   */
};

exports.sendSocketMessage = async (message: BaseSignalingMessage) => {};

exports.sendIPCMasterMessage = async (message: BaseSignalingMessage) => {};

exports.handleClientDisconnect = async (webSocket: CustomWebSocket) => {};
