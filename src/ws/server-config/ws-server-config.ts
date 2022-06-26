import { ServerOptions } from "ws";
import { CustomWebSocket } from "../../types/websocket";
import { ServerConstants } from "../../utils/ServerConstants";

const WsServerConfig: ServerOptions = {
  port: parseInt(process.env.WS_PORT!),
  WebSocket: CustomWebSocket,
};

export { WsServerConfig };
