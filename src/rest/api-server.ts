import { inject, singleton } from "tsyringe";
import { SimpleLogger } from "../logging/logger-impl";
import Express from "express";
import http from "http";
import https from "https";
import { ServerConstants } from "../utils/ServerConstants";
import { ApiService } from "../service/api-spec";

@singleton()
export class SignalingApiServer {
  private app: Express.Application | undefined;
  constructor(
    @inject("logger") private logger: SimpleLogger,
    @inject("apiServerOptions") private serverOptions: https.ServerOptions,
    @inject("apiService") private apiService: ApiService
  ) {
    logger.info(`signaling api server is intantiated!`);
  }

  async init(): Promise<void> {
    try {
      this.app = Express();
      this.app.use(Express.json());
      this.app.use(Express.urlencoded({ extended: true }));

      // to resolve CORS related issues
      this.app.use(function (
        request: Express.Request,
        response: Express.Response,
        next: Express.NextFunction
      ) {
        response.header("Access-Control-Allow-Origin", "*");
        response.header(
          "Access-Control-Allow-Headers",
          "Origin, X-Requested-With, Content-Type, Accept"
        );
        next();
      });

      /**
       * error handler
       */
      this.app.use(
        (
          error: Express.Errback,
          request: Express.Request,
          respose: Express.Response,
          next: Express.NextFunction
        ) => {
          next();
        }
      );

      await this.registerApis(this.app);

      if (process.env.SECURE_SERVER === "true") {
        https
          .createServer(this.serverOptions, this.app)
          .listen(ServerConstants.API_SERVER_PORT, () => {
            this.logger.info(
              `secured api server started on port: ${ServerConstants.API_SERVER_PORT}`
            );
          });
      } else {
        http
          .createServer(this.app)
          .listen(ServerConstants.API_SERVER_PORT, () => {
            this.logger.info(
              `api server started on port: ${ServerConstants.API_SERVER_PORT}`
            );
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
  async registerApis(app: Express.Application): Promise<void> {
    app.get(
      `${ServerConstants.API_BASE_URL}/user/status/:name`,
      this.apiService.getUserStatus.bind(this.apiService)
    );
    app.get(
      `${ServerConstants.API_BASE_URL}/users/active`,
      this.apiService.getActiveUsers.bind(this.apiService)
    );
    app.get(
      `${ServerConstants.API_BASE_URL}/groups/users/active`,
      this.apiService.getActiveUsers.bind(this.apiService)
    );
    app.post(
      `${ServerConstants.API_BASE_URL}/group/register`,
      this.apiService.processGroupRegisteration.bind(this.apiService)
    );
  }
}
