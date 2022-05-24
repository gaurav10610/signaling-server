import { BaseSignalingMessage } from "../../types/message";
import { ServerContext, UserContext } from "../../types/user-context";
import { CustomWebSocket } from "../../types/websocket";

/**
 * handle user registeration on signaling server
 * @param message
 * @param webSocket
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

exports.handleClientDeRegister = async (
  message: BaseSignalingMessage,
  webSocket: CustomWebSocket
) => {
  if (global.serverContext.hasUserContext(message.from)) {
    const userContext: UserContext = global.serverContext.getUserContext(
      message.from
    )!;

    const groups: string[] | undefined = userContext.groups;

    /**
     * if user is part of any group then mark him/her inactive from that group
     */
    if (groups && groups.length > 0) {
      groups.forEach((groupName) => {
        global.serverContext.removeUserFromGroup(
          webSocket.id!,
          message.from,
          groupName
        );
      });
    }
  }
};

exports.broadCastMessage = async (message: BaseSignalingMessage) => {};

exports.sendClientMessage = async (message: BaseSignalingMessage) => {};

exports.sendIPCMasterMessage = async (message: BaseSignalingMessage) => {};

exports.handleClientDisconnect = async (webSocket: CustomWebSocket) => {};
