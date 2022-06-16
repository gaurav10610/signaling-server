import {
  ActiveGroupUsersResponse,
  GetActiveUsersResponse,
  GetUserStatusResponse,
  GroupRegisterResponse,
} from "../types/api/api-response";
import Express from "express";

export interface ApiService {
  getUserStatus(
    request: Express.Request,
    response: Express.Response
  ): Promise<GetUserStatusResponse>;

  getActiveUsers(
    request: Express.Request,
    response: Express.Response
  ): Promise<GetActiveUsersResponse>;

  getActiveGroupUsers(
    request: Express.Request,
    response: Express.Response
  ): Promise<ActiveGroupUsersResponse>;

  processGroupRegisteration(
    request: Express.Request,
    response: Express.Response
  ): Promise<GroupRegisterResponse>;
}
