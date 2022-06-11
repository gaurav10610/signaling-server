import { inject, singleton } from "tsyringe";
import { SimpleLogger } from "./logging/logger-impl";
import { WsServer } from "./ws/server/ws-server";

@singleton()
export class WorkerServer {
  constructor(
    @inject("serverConfig") serverConfig: any,
    @inject("logger") private logger: SimpleLogger,
    @inject("wsServer") private wsServer: WsServer
  ) {}

  public async init(): Promise<void> {
    this.logger.info(`initializaing worker server instance!`);
    this.wsServer.init();
  }
}
