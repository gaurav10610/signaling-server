import { Logger } from "winston";
import { ServerContext } from "./user-context";

// global.d.ts
declare global {
  var logger: Logger;
  var serverContext: ServerContext;
}
