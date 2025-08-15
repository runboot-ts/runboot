import { LoggerService } from "./LoggerService";

export class LoggerServiceProd implements LoggerService {
    log(message: string) {
        console.info(message);
    }
    debug(message: string) {
        // dev/null
    }
}
