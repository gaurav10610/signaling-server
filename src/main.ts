import "reflect-metadata";
import { WorkerServer } from "./worker";

export async function init(): Promise<void> {
  const serverConfig: any = {};
  const workerServer: WorkerServer = new WorkerServer(serverConfig);
  await workerServer.init();
}

init().then(() => {
  global.logger.info(`instashare server has been started successfully`);
  global.logger.info(`${process.env.NODE_ENV} profile is active`);
});
