export interface BaseSignalingMessage {
  from: string;
  to: string[] | string;
  type: SignalingMessageType;
  isClientMessage?: boolean;
  broadCastType?: BroadCastType;
}

export enum BroadCastType {
  ALL,
  GROUP,
}

// connection open acknowledment
export interface ConnectAck extends BaseSignalingMessage {
  authorization: string;
  connectionId: string;
}

export enum SignalingMessageType {
  CONNECT = "conn",
  REGISTER = "reg",
  DEREGISTER = "dereg",
  GROUP_REGISTER = "reggrp",
  GROUP_DEREGISTER = "dereggrp",
}

export enum IPCMessageType {
  REGISTER = "register",
  DEREGISTER = "deregister",
  BROADCAST_MESSAGE = "broadcast",
  USER_MESSAGE = "user-message",
  CONNECTION_STATUS = "connection-status",
}

export interface IPCMessage {
  type: IPCMessageType;
  message: any;
  serverId: number;
}

export interface ClientConnectionStatus {
  connected: boolean;
  connectionId: string;
  serverId: number;
}

export interface RegisterAck extends BaseSignalingMessage {
  success: boolean;
}

export interface GroupRegisterMessage extends BaseSignalingMessage {
  groupName: string;
}

export enum ErrorMessageType {
  REGISTER_ERROR = "regerr",
  GROUP_REGISTER_ERROR = "reggrperr",
}

export interface BaseWsServerErrorMessage extends BaseSignalingMessage {
  message: string;
  errorType: ErrorMessageType;
}
