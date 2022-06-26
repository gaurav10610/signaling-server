import { createLogger, Logger, LoggerOptions, transports } from "winston";
import * as Transport from "winston-transport";
import * as logform from "logform";
import { singleton } from "tsyringe";
import cluster from "cluster";

@singleton()
export class SimpleLogger {
  private logger: Logger;

  constructor() {
    const transportsConfig: Transport[] = [];
    if (process.env.NODE_ENV === undefined || process.env.NODE_ENV === "dev") {
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
      level: process.env.LOG_LEVEL,
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
              cluster.isPrimary ? "primary" : "worker"
            }: ${process.pid}: ${info.message}`
        )
      ),
    };
    this.logger = createLogger(loggerOptions);
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
