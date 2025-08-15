import { LoggerServiceDev } from "../infra/LoggerServiceDev";
import { LoggerService } from "../infra/LoggerService";

export abstract class AppProviderDev {
    provideLogger(): LoggerService {
        return new LoggerServiceDev();
    }
}
