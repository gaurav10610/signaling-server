import { ApiExceptionHandler } from "./../exception/handler";
import { inject, singleton } from "tsyringe";
import { SimpleLogger } from "../logging/logger-impl";
import Express, { Application, NextFunction, Request, Response } from "express";
import http from "http";
import https from "https";
import { ServerConstants } from "../utils/ServerConstants";
import { ApiService } from "../service/api-spec";
import {
  ActiveGroupUsersResponse,
  GetActiveUsersResponse,
  GetUserStatusResponse,
  GroupRegisterResponse,
} from "../types/api/api-response";
import { GroupRegisterRequest } from "../types/api/api-request";
import { CompleterResult } from "readline";
import cors from "cors";

@singleton()
export class SignalingApiServer {
  private app: Express.Application | undefined;
  constructor(
    @inject("logger") private logger: SimpleLogger,
    @inject("apiServerOptions") private serverOptions: https.ServerOptions,
    @inject("corsOptions") private corsOptions: cors.CorsOptions,
    @inject("apiService") private apiService: ApiService,
    @inject("apiErrorHandler") private errorHandler: ApiExceptionHandler
  ) {
    logger.info(`signaling api server is intantiated!`);
  }

  async init(): Promise<void> {
    try {
      this.app = Express();

      // middlewares registeration
      this.app.use(cors(this.corsOptions));
      this.app.use(Express.json());
      this.app.use(Express.urlencoded({ extended: true }));

      await this.registerApis(this.app);

      // error handler middleware
      this.app.use(this.errorHandler.handleError.bind(this.errorHandler));

      // start api server
      const API_SERVER_PORT: number = process.env.API_SERVER_PORT
        ? parseInt(process.env.API_SERVER_PORT)
        : 9191;

      if (process.env.SECURE_SERVER === "true") {
        https
          .createServer(this.serverOptions, this.app)
          .listen(API_SERVER_PORT, () => {
            this.logger.info(
              `secured api server started on port: ${API_SERVER_PORT}`
            );
          });
      } else {
        http.createServer(this.app).listen(API_SERVER_PORT, () => {
          this.logger.info(`api server started on port: ${API_SERVER_PORT}`);
        });
      }
    } catch (error) {
      this.logger.error(`error occured while setting up api server`);
    }
  }

  /**
   * register all the apis on api server
   * @param app
   */
  async registerApis(app: Application): Promise<void> {
    // get user status
    app.get(
      `${ServerConstants.API_BASE_URL}/user/status/:username`,
      async (
        httpRequest: Request,
        httpResponse: Response,
        next: NextFunction
      ) => {
        try {
          const response: GetUserStatusResponse =
            await this.apiService.getUserStatus(httpRequest.params.username);
          httpResponse.json(response);
        } catch (error) {
          next(error);
        }
      }
    );

    // get all active users
    app.get(
      `${ServerConstants.API_BASE_URL}/users/active`,
      async (
        httpRequest: Request,
        httpResponse: Response,
        next: NextFunction
      ) => {
        try {
          const response: GetActiveUsersResponse =
            await this.apiService.getActiveUsers();
          httpResponse.json(response);
        } catch (error) {
          next(error);
        }
      }
    );

    // get all active group users
    app.get(
      `${ServerConstants.API_BASE_URL}/groups/users/active`,
      async (
        httpRequest: Request,
        httpResponse: Response,
        next: NextFunction
      ) => {
        try {
          const groupName: string = httpRequest.query.groupName
            ? (httpRequest.query.groupName as string).trim()
            : "";
          const response: ActiveGroupUsersResponse =
            await this.apiService.getActiveGroupUsers(groupName);
          httpResponse.json(response);
        } catch (error) {
          next(error);
        }
      }
    );

    // process group registeration request
    app.post(
      `${ServerConstants.API_BASE_URL}/group/register`,
      async (
        httpRequest: Request,
        httpResponse: Response,
        next: NextFunction
      ) => {
        try {
          const response: GroupRegisterResponse =
            await this.apiService.processGroupRegisteration(
              httpRequest.body as GroupRegisterRequest
            );
          httpResponse.json(response);
        } catch (error) {
          next(error);
        }
      }
    );
  }
}
