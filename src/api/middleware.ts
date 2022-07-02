import { BaseSignalingServerException } from "../exception/handler";
import { NextFunction, Request, Response } from "express";
import { IncomingHttpHeaders } from "http";
import { inject, singleton } from "tsyringe";
import { SimpleLogger } from "../logging/logger-impl";

@singleton()
export class ServerMiddleWare {
  constructor(@inject("logger") private logger: SimpleLogger) {
    logger.info("api validator instantiated");
  }

  /**
   * log api request
   * @param httpRequest
   * @param httpResponse
   * @param next
   */
  async logRequest(
    httpRequest: Request,
    httpResponse: Response,
    next: NextFunction
  ) {
    if (httpRequest.method.toLowerCase() === "get") {
      this.logger.info(
        `api request received:  { method '${httpRequest.method}', uri: '${httpRequest.url}' }`
      );
    } else {
      this.logger.info(
        `api request received:  { method '${httpRequest.method}', uri:' ${
          httpRequest.url
        }', body: ${JSON.stringify(httpRequest.body)} }`
      );
    }
    next();
  }

  /**
   * validate api request headers
   */
  async validateHeaders(httpRequest: Request) {
    if (httpRequest.header("connection-id") === undefined) {
      throw new BaseSignalingServerException(
        422,
        "connection-id header is required"
      );
    }
  }
}
