import { UserService } from "./../user-spec";
import { UserContext } from "./../../types/context";
import { inject, singleton } from "tsyringe";
import { SimpleLogger } from "../../logging/logger-impl";
import {
  GetUserStatusResponse,
  GetActiveUsersResponse,
  ActiveGroupUsersResponse,
  BaseSuccessResponse,
  ServerContextResponse,
} from "../../types/api/api-response";
import { ApiService } from "../api-spec";
import { ServerContext } from "../../types/context";
import {
  GroupRegisterRequest,
  UserRegisterRequest,
} from "../../types/api/api-request";

@singleton()
export class ApiServiceImpl implements ApiService {
  constructor(
    @inject("logger") private logger: SimpleLogger,
    @inject("serverContext") private serverContext: ServerContext,
    @inject("userService") private userService: UserService
  ) {
    logger.info(`api service is instantiated!`);
  }

  /**
   * get internal server context
   * @returns ServerContextResponse
   */
  async getServerContext(): Promise<ServerContextResponse> {
    return {
      clientConnections: Object.fromEntries(
        this.serverContext.getAllConnections()
      ),
    };
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
    this.serverContext
      .getAllActiveUsers()
      .forEach((userContext: UserContext, username: string) => {
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
  async getActiveGroupUsers(
    groupName: string
  ): Promise<ActiveGroupUsersResponse> {
    const response: ActiveGroupUsersResponse = {
      groups: new Map(),
    };
    if (groupName.length > 0 && this.serverContext.hasGroupContext(groupName)) {
      response.groups.set(
        groupName,
        this.serverContext.getGroupContext(groupName)!
      );
    } else {
      response.groups = this.serverContext.getAllActiveGroupUsers();
    }
    return response;
  }

  /**
   * handle user register/de-register requests
   * @param userRegisterRequest
   */
  async processUserRegisteration(
    userRegisterRequest: UserRegisterRequest
  ): Promise<BaseSuccessResponse> {
    let response: BaseSuccessResponse;
    if (userRegisterRequest.needRegister) {
      response = await this.userService.handleUserRegister(
        userRegisterRequest.username
      );
    } else {
      response = await this.userService.handleUserDeRegister(
        userRegisterRequest.username
      );
    }
    return response;
  }

  /**
   * handle group register/de-register requests
   * @param groupRegisterRequest
   */
  async processGroupRegisteration(
    groupRegisterRequest: GroupRegisterRequest
  ): Promise<BaseSuccessResponse> {
    let response: BaseSuccessResponse;
    if (groupRegisterRequest.needRegister) {
      response = await this.userService.handleGroupRegister(
        groupRegisterRequest.username,
        groupRegisterRequest.groupName
      );
    } else {
      response = await this.userService.handleGroupDeRegister(
        groupRegisterRequest.username,
        groupRegisterRequest.groupName
      );
    }
    return response;
  }
}
