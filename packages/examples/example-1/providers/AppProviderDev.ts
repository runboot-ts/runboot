import { LoggerServiceDev } from "../infra/LoggerServiceDev";
import { LoggerService } from "../infra/LoggerService";

export abstract class AppProviderDev {
    abstract provideLogger(impl: LoggerServiceDev): LoggerService;
}
