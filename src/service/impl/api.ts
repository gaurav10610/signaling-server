import { BaseSignalingServerException } from "./../../exception/handler";
import { BaseSignalingMessage } from "./../../types/message";
import { UserContext } from "./../../types/context";
import { inject, singleton } from "tsyringe";
import { SimpleLogger } from "../../logging/logger-impl";
import {
  GetUserStatusResponse,
  GetActiveUsersResponse,
  GroupRegisterResponse,
  ActiveGroupUsersResponse,
} from "../../types/api/api-response";
import { ApiService } from "../api-spec";
import { ServerContext } from "../../types/context";
import { GroupRegisterRequest } from "../../types/api/api-request";

@singleton()
export class ApiServiceImpl implements ApiService {
  constructor(
    @inject("logger") private logger: SimpleLogger,
    @inject("serverContext") private serverContext: ServerContext
  ) {
    logger.info(`api service is instantiated!`);
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
   * handle group registeration
   * @param groupRegisterRequest
   */
  async processGroupRegisteration(
    groupRegisterRequest: GroupRegisterRequest
  ): Promise<GroupRegisterResponse> {
    throw new BaseSignalingServerException(500, "Method not implemented.");
  }
}
