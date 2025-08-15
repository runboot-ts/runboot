import { LoggerService } from "./LoggerService";

export class LoggerServiceDev implements LoggerService {
    log(message: string) {
        console.info(message);
    }
    debug(message: string) {
        console.debug(message);
    }
}
