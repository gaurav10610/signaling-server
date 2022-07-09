import { UserRegisterRequest } from "./../types/api/api-request";
import {
  ActiveGroupUsersResponse,
  BaseSuccessResponse,
  GetActiveUsersResponse,
  GetUserStatusResponse,
  ServerContextResponse,
} from "../types/api/api-response";
import { GroupRegisterRequest } from "../types/api/api-request";

export interface ApiService {
  getServerContext(): Promise<ServerContextResponse>;
  getUserStatus(username: string): Promise<GetUserStatusResponse>;
  getActiveUsers(): Promise<GetActiveUsersResponse>;
  getActiveGroupUsers(groupName: string): Promise<ActiveGroupUsersResponse>;
  processUserRegisteration(request: UserRegisterRequest, connectionId: string): Promise<BaseSuccessResponse>;
  processGroupRegisteration(request: GroupRegisterRequest): Promise<BaseSuccessResponse>;
}
