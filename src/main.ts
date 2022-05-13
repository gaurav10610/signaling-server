import { SimpleLogger } from "./logging/logger-impl";

function init(): void {
  global.logger = new SimpleLogger().getLogger();
  global.logger.info(`server has started!`);
}

init();
