export interface BaseSignalingMessage {
  from: string;
  to: string[] | string;
  type: SignalingMessageType;
}

// connection acknowledment
export interface ConnectAck extends BaseSignalingMessage {
  authorization: string;
}

export enum SignalingMessageType {
  CONNECT = "connect",
}

export enum IPCMessageType {
  USER_STATUS,
  BROADCAST_MESSAGE,
  USER_MESSAGE,
}

export interface IPCMessage {
  type: IPCMessageType;
  message: BaseSignalingMessage;
}
