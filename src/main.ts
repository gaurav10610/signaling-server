import dotenv from "dotenv";
dotenv.config({
  path: `./environment/${process.env.NODE_ENV}/variables.env`,
});
import "reflect-metadata";
import { container } from "tsyringe";
import "./ioc/worker/ioc-container-config";
import { SimpleLogger } from "./logging/logger-impl";
import { WorkerServer } from "./worker";

export async function init(): Promise<void> {
  const workerServer: WorkerServer = container.resolve(WorkerServer);
  await workerServer.init();
}

init().then(() => {
  const logger: SimpleLogger = container.resolve<SimpleLogger>("logger");
  logger.info(`instashare server has been started successfully!`);
  logger.info(`${process.env.NODE_ENV} profile is active`);
});
