import { BaseSignalingMessage, IPCMessage } from "./message";

export interface CommunicationService {
  sendPrimaryServerMessage(data: IPCMessage): Promise<void>;
  sendWorkerMessage(serverId: number, message: IPCMessage): Promise<void>;
  sendSocketMessage(data: BaseSignalingMessage): Promise<void>;
  broadCastMessage(data: BaseSignalingMessage): Promise<void>;
}
