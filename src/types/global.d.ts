import { Logger } from "winston";

// global.d.ts
declare global {
  var logger: Logger;
  var serverContext: ServerContext;
}
