import { WorkerServer } from "./worker";

export async function init(): Promise<void> {
  console.log(`${process.env.NODE_ENV} profile is active`);
  const serverConfig: any = {};
  const workerServer: WorkerServer = new WorkerServer(serverConfig);
  await workerServer.init();
}

if (process.env.NODE_ENV !== "test") {
  init().then(() => {
    global.logger.info(`instashare server has been started successfully`);
  });
}
