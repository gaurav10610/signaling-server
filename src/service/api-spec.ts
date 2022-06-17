import {
  ActiveGroupUsersResponse,
  GetActiveUsersResponse,
  GetUserStatusResponse,
  GroupRegisterResponse,
} from "../types/api/api-response";
import { GroupRegisterRequest } from "../types/api/api-request";

export interface ApiService {
  getUserStatus(username: string): Promise<GetUserStatusResponse>;

  getActiveUsers(): Promise<GetActiveUsersResponse>;

  getActiveGroupUsers(groupName: string): Promise<ActiveGroupUsersResponse>;

  processGroupRegisteration(
    groupRegisterRequest: GroupRegisterRequest
  ): Promise<GroupRegisterResponse>;
}
