import { LoggerService } from "./LoggerService";
import { DIContainer } from "@runboot/di";

type LoggerServiceDevDeps = {
    container: DIContainer;
};
export class LoggerServiceDev implements LoggerService {
    constructor(private deps: LoggerServiceDevDeps) {
        console.info("[LoggerServiceDev] Initialized LoggerService", this.deps.container);
    }

    log(message: string) {
        console.info(message);
    }
    debug(message: string) {
        console.debug(message);
    }
}
