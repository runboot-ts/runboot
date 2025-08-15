import { LoggerServiceProd } from "../infra/LoggerServiceProd";
import { LoggerService } from "../infra/LoggerService";

export abstract class AppProviderProd {
    abstract provideLogger(impl: LoggerServiceProd): LoggerService;
}
