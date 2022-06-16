import { GroupContext, UserContext } from "./../../types/context";
import { inject, singleton } from "tsyringe";
import { SimpleLogger } from "../../logging/logger-impl";
import {
  GetUserStatusResponse,
  GetActiveUsersResponse,
  GroupRegisterResponse,
  ActiveGroupUsersResponse,
} from "../../types/api/api-response";
import { ApiService } from "../api-spec";
import Express from "express";
import { ServerContext } from "../../types/context";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

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
   * @param request
   * @param response
   * @returns
   */
  async getUserStatus(
    request: Express.Request,
    response: Express.Response
  ): Promise<GetUserStatusResponse> {
    const userStatusResponse: GetUserStatusResponse = {
      status: this.serverContext.hasUserContext(request.params.name),
    };
    return userStatusResponse;
  }

  /**
   * get all the active users grouped by group name
   * @param request
   * @param response
   */
  async getActiveUsers(
    request: Express.Request,
    response: Express.Response
  ): Promise<GetActiveUsersResponse> {
    // respose object
    const activeUsersResponse: GetActiveUsersResponse = {
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
            if (!activeUsersResponse.groups.has(groupName)) {
              activeUsersResponse.groups.set(groupName, {
                users: [],
              });
            }
            activeUsersResponse.groups.get(groupName)!.users.push(username);
          });
        } else {
          activeUsersResponse.nonGroupUsers.push(username);
        }
      });

    return activeUsersResponse;
  }

  /**
   * get all the active group users
   * @param request
   * @param response
   */
  async getActiveGroupUsers(
    request: Express.Request,
    response: Express.Response
  ): Promise<ActiveGroupUsersResponse> {
    const groupName: string = request.query.groupName
      ? <string>request.query.groupName
      : "";
    const activeGroupUsers: ActiveGroupUsersResponse = {
      groups: new Map(),
    };
    if (
      groupName.length > 0 &&
      this.serverContext.hasGroupContext(groupName.trim())
    ) {
      activeGroupUsers.groups.set(
        groupName,
        this.serverContext.getGroupContext(groupName)!
      );
    } else {
      activeGroupUsers.groups = this.serverContext.getAllActiveGroupUsers();
    }
    return activeGroupUsers;
  }

  async processGroupRegisteration(
    request: Express.Request,
    response: Express.Response
  ): Promise<GroupRegisterResponse> {
    throw new Error("Method not implemented.");
  }
}
