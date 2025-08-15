import { LoggerServiceProd } from "../infra/LoggerServiceProd";
import { LoggerService } from "../infra/LoggerService";

export abstract class AppProviderProd {
    provideLogger(): LoggerService {
        return new LoggerServiceProd();
    }
}
