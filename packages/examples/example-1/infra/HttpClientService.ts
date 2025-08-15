import { LoggerService } from "./LoggerService";

type HttpClientServiceDeps = {
    logger: LoggerService;
};
export class HttpClientService {
    constructor(private deps: HttpClientServiceDeps) {}
    public fetch(): Promise<unknown> {
        this.deps.logger.debug("HttpClientService fetch");
        return Promise.resolve({ foo: "bar" });
    }
}
