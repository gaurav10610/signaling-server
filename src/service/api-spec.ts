import {
  GetActiveUsersResponse,
  GetUserStatusResponse,
  GroupRegisterResponse,
} from "../types/api/api-response";
import Express from "express";

export interface ApiService {
  getUserStatus(
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ): Promise<GetUserStatusResponse>;

  getActiveUsers(
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ): Promise<GetActiveUsersResponse>;

  processGroupRegisteration(
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ): Promise<GroupRegisterResponse>;
}
