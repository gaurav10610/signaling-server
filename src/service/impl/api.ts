import { inject, singleton } from "tsyringe";
import { SimpleLogger } from "../../logging/logger-impl";
import {
  GetUserStatusResponse,
  GetActiveUsersResponse,
  GroupRegisterResponse,
} from "../../types/api/api-response";
import { ApiService } from "../api-spec";
import Express from "express";

@singleton()
export class ApiServiceImpl implements ApiService {
  constructor(@inject("logger") private logger: SimpleLogger) {
    logger.info(`api service is instantiated!`);
  }

  async getUserStatus(
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ): Promise<GetUserStatusResponse> {
    throw new Error("Method not implemented.");
  }

  async getActiveUsers(
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ): Promise<GetActiveUsersResponse> {
    throw new Error("Method not implemented.");
  }

  async processGroupRegisteration(
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ): Promise<GroupRegisterResponse> {
    throw new Error("Method not implemented.");
  }
}
