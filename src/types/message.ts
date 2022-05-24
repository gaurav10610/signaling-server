export interface BaseSignalingMessage {
  from: string;
  to: string[] | string;
  type: SignalingMessageType;
}

export enum SignalingMessageType {
  REGISTER = "register",
  DEREGISTER = "deregister",
}
