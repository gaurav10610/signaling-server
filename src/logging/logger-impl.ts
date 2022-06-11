import { createLogger, Logger, LoggerOptions, transports } from "winston";
import * as Transport from "winston-transport";
import * as logform from "logform";

export class SimpleLogger {
  private logger: Logger;

  constructor(options?: LoggerOptions) {
    if (options) {
      this.logger = createLogger(options);
    } else {
      const transportsConfig: Transport[] = [];
      if (
        process.env.NODE_ENV === undefined ||
        process.env.NODE_ENV === "dev"
      ) {
        transportsConfig.push(new transports.Console());
      } else {
        transportsConfig.push(
          new transports.File({
            filename: process.env.LOG_FILE_PATH
              ? process.env.LOG_FILE_PATH
              : "logs/signaling-server.log",
          })
        );
      }
      const loggerOptions: LoggerOptions = {
        transports: transportsConfig,
        format: logform.format.combine(
          logform.format.label({
            label: process.env.SERVICE_NAME
              ? process.env.SERVICE_NAME
              : "signaling-server",
          }),
          logform.format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
          logform.format.printf(
            (info) =>
              `${info.level}: ${info.label}: ${[info.timestamp]}: ${
                info.message
              }`
          )
        ),
      };
      this.logger = createLogger(loggerOptions);
    }
  }

  getLogger(): Logger {
    return this.logger;
  }

  error(message: string) {
    this.logger.error(message);
  }

  info(message: string) {
    this.logger.info(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }
}
