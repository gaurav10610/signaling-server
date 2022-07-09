import { BaseSignalingServerException } from "../exception/ApiExceptionHandler";
import { NextFunction, Request, Response } from "express";
import { inject, singleton } from "tsyringe";
import { SimpleLogger } from "../logging/SimpleLogger";

@singleton()
export class ServerMiddleWare {
  httpBodyMethods = ["post", "put"];

  constructor(@inject("logger") private logger: SimpleLogger) {
    logger.info("api middleware instantiated!");
  }

  /**
   * log api request
   * @param httpRequest
   * @param httpResponse
   * @param next
   */
  async logRequest(httpRequest: Request, httpResponse: Response, next: NextFunction) {
    const requestLogObject = {
      method: httpRequest.method,
      url: httpRequest.url,
      connectionId: httpRequest.header("connection-id"),
      body: null,
    };
    if (this.httpBodyMethods.includes(httpRequest.method.toLowerCase())) {
      requestLogObject.body = httpRequest.body;
    }
    this.logger.info("api request ", requestLogObject);
    next();
  }

  /**
   * validate api request headers
   */
  async validateHeaders(httpRequest: Request) {
    if (httpRequest.header("connection-id") === undefined) {
      throw new BaseSignalingServerException(422, "connection-id header is required");
    }
  }
}
