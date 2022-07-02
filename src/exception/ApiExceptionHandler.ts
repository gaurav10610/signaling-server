import { NextFunction, Request, Response } from "express";
import { inject, singleton } from "tsyringe";
import { SimpleLogger } from "../logging/SimpleLogger";

@singleton()
export class ApiExceptionHandler {
  constructor(@inject("logger") private logger: SimpleLogger) {
    this.logger.info("api error handler is instantiated!");
  }

  /**
   * handle error thrown in api request handling
   * @param err
   * @param httpRequest
   * @param httpResponse
   * @param next
   */
  handleError(
    err: any,
    httpRequest: Request,
    httpResponse: Response,
    next: NextFunction
  ) {
    this.logger.error(
      `error occured while handle api request with uri: ${httpRequest.url}`
    );
    if (err instanceof BaseSignalingServerException) {
      const error: BaseSignalingServerException =
        err as BaseSignalingServerException;
      httpResponse.status(error.status).send({
        message: error.message,
      });
    }
    next(err);
  }
}

export class BaseSignalingServerException extends Error {
  public status: number;
  public message: string;

  /**
   * @param status http response status
   * @param message error message
   */
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}
