import cluster, { Worker } from "cluster";
process.env.NODE_ENV = process.env.NODE_ENV?.trim();
import dotenv from "dotenv";
dotenv.config({
  path: `./environment/${process.env.NODE_ENV}/variables.env`,
});
import "reflect-metadata";
import { container } from "tsyringe";
import "./ioc/ioc-container-config";
import { SimpleLogger } from "./logging/logger-impl";
import { PrimaryServer } from "./primary";
import { WorkerServer } from "./worker";
import os from "os";

export async function initPrimary(): Promise<void> {
  const primaryServer: PrimaryServer = container.resolve(PrimaryServer);
  const workers: Worker[] = [];
  const processCount: number = process.env.WORKERS_COUNT
    ? parseInt(process.env.WORKERS_COUNT)
    : os.cpus().length;
  for (let i = 0; i < processCount; i++) {
    workers.push(cluster.fork({ ...process.env, SERVER_ID: i }));
  }
  await primaryServer.init(workers);
}

export async function initWorker(): Promise<void> {
  const logger: SimpleLogger = container.resolve<SimpleLogger>("logger");
  logger.info(
    `starting an instance of worker server with server id: ${process.env.SERVER_ID}`
  );
  const workerServer: WorkerServer = container.resolve(WorkerServer);
  await workerServer.init();
}

export async function init(): Promise<void> {
  const logger: SimpleLogger = container.resolve<SimpleLogger>("logger");
  if (cluster.isPrimary) {
    await initPrimary();
  } else {
    await initWorker();
  }
  logger.info(
    `instashare ${
      cluster.isPrimary ? "primary" : "worker"
    } server has been started successfully!`
  );
  logger.info(`${process.env.NODE_ENV?.trimEnd()} profile is active`);
}

// start server
init();
