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
          filename: process.env.LOG_FILE_PATH ? process.env.LOG_FILE_PATH : "logs/signaling-server.log",
        })
      );
    }

    const serverType: string = cluster.isPrimary ? "primary" : "worker";

    /**
     * log formatters
     */
    const logFormats: logform.Format[] = [
      logform.format.label({
        label: process.env.SERVICE_NAME ? process.env.SERVICE_NAME : "signaling-server",
      }),
      logform.format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
      logform.format.splat(),
      logform.format.metadata({ fillExcept: ["message", "level", "timestamp", "label"] }),
    ];

    /**
     * colored logs in case of console logs
     */
    if (process.env.NODE_ENV === "production") {
      logFormats.push(
        logform.format.printf(
          (info) =>
            `{ 'level': '${info.level}', 'label': '${info.label}', 'timestamp': '${[
              info.timestamp,
            ]}', 'serverType': '${serverType}', 'processId': '${process.pid}', 'message': '${info.message}' }`
        )
      );
    } else {
      logFormats.push(
        logform.format.colorize({
          message: true,
          level: true,
        })
      );

      logFormats.push(
        logform.format.printf((info) => {
          let logMessage: string = `${info.level}: ${info.label}: ${[info.timestamp]}: ${serverType}: ${process.pid}: ${
            info.message
          }`;

          // append metadata to logMessage
          if (Object.keys(info.metadata).length > 0) {
            for (const data of Object.values(info.metadata)) {
              logMessage = logMessage + ": " + JSON.stringify(data);
            }
          }
          return logMessage;
        })
      );
    }

    const loggerOptions: LoggerOptions = {
      level: process.env.LOG_LEVEL,
      transports: transportsConfig,
      format: logform.format.combine(...logFormats),
      exitOnError: false,
    };
    this.logger = createLogger(loggerOptions);
  }

  error(message: string, ...meta: any[]) {
    this.logger.error(message, meta);
  }

  info(message: string, ...meta: any[]) {
    this.logger.info(message, meta);
  }

  debug(message: string, ...meta: any[]) {
    this.logger.debug(message, meta);
  }
}
