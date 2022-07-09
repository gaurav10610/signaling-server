import { PrimaryUserServiceImpl } from "./PrimaryUserServiceImpl";
import { UserContext } from "../../types/context";
import { inject, singleton } from "tsyringe";
import { SimpleLogger } from "../../logging/SimpleLogger";
import {
  GetUserStatusResponse,
  GetActiveUsersResponse,
  ActiveGroupUsersResponse,
  BaseSuccessResponse,
  ServerContextResponse,
} from "../../types/api/api-response";
import { ApiService } from "../api-spec";
import { GroupRegisterRequest, UserRegisterRequest } from "../../types/api/api-request";
import { InMemoryServerContext } from "../../context/InMemoryServerContext";

@singleton()
export class ApiServiceImpl implements ApiService {
  constructor(
    @inject("logger") private logger: SimpleLogger,
    @inject("serverContext") private serverContext: InMemoryServerContext,
    @inject("userService") private userService: PrimaryUserServiceImpl
  ) {
    logger.info(`api service is instantiated!`);
  }

  /**
   * get internal server context
   * @returns ServerContextResponse
   */
  async getServerContext(): Promise<ServerContextResponse> {
    const response: ServerContextResponse = {
      clientConnections: Object.fromEntries(this.serverContext.getAllConnections()),
      users: Object.fromEntries(this.serverContext.getAllActiveUsers()),
    };
    return response;
  }

  /**
   * get active status of a single user
   * @param username
   * @returns
   */
  async getUserStatus(username: string): Promise<GetUserStatusResponse> {
    const response: GetUserStatusResponse = {
      status: this.serverContext.hasUserContext(username),
    };
    return response;
  }

  /**
   * get all the active users grouped by group name
   */
  async getActiveUsers(): Promise<GetActiveUsersResponse> {
    const response: GetActiveUsersResponse = {
      groups: new Map(),
      nonGroupUsers: [],
    };
    this.serverContext.getAllActiveUsers().forEach((userContext: UserContext, username: string) => {
      // check if user is part of some group
      if (userContext.groups && userContext.groups.length > 0) {
        userContext.groups.forEach((groupName) => {
          // check if group context has already been initialized
          if (!response.groups.has(groupName)) {
            response.groups.set(groupName, {
              users: [],
            });
          }
          response.groups.get(groupName)!.users.push(username);
        });
      } else {
        response.nonGroupUsers.push(username);
      }
    });

    return response;
  }

  /**
   * get all the active group users
   * @param groupName
   */
  async getActiveGroupUsers(groupName: string): Promise<ActiveGroupUsersResponse> {
    const response: ActiveGroupUsersResponse = {
      groups: new Map(),
    };
    if (groupName.length > 0 && this.serverContext.hasGroupContext(groupName)) {
      response.groups.set(groupName, this.serverContext.getGroupContext(groupName)!);
    } else {
      response.groups = this.serverContext.getAllActiveGroupUsers();
    }
    return response;
  }

  /**
   * handle user register/de-register requests
   * @param request
   * @param connectionId unique connection id of client
   */
  async processUserRegisteration(request: UserRegisterRequest, connectionId: string): Promise<BaseSuccessResponse> {
    if (request.needRegister) {
      return this.userService.handleUserRegister(request.username, connectionId);
    } else {
      return this.userService.handleUserDeRegister(request.username, connectionId);
    }
  }

  /**
   * handle group register/de-register requests
   * @param request
   */
  async processGroupRegisteration(request: GroupRegisterRequest): Promise<BaseSuccessResponse> {
    if (request.needRegister) {
      return this.userService.handleGroupRegister(request.username, request.groupName);
    } else {
      return this.userService.handleGroupDeRegister(request.username, request.groupName);
    }
  }
}
