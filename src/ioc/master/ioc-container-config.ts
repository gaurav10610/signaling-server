import { container, Lifecycle } from "tsyringe";
import { InMemoryServerContext } from "../../context/server-context";
import { SimpleLogger } from "../../logging/logger-impl";
import { UserServiceImpl } from "../../service/impl/user";

container.register<any>("serverConfig", { useValue: {} });
container.register("logger", SimpleLogger, { lifecycle: Lifecycle.Singleton });
container.register("serverContext", InMemoryServerContext, {
  lifecycle: Lifecycle.Singleton,
});
container.register("userService", UserServiceImpl, {
  lifecycle: Lifecycle.Singleton,
});
