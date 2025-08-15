import { LoggerService } from "../infra/LoggerService";
import { HttpClientService } from "../infra/HttpClientService";
import { AppStoreValue } from "../stores/AppStore";

export type GetDataServiceDeps = {
    logger: LoggerService;
    httpClient: HttpClientService;
};

export class GetDataService {
    constructor(private deps: GetDataServiceDeps) {}

    execute(): Promise<AppStoreValue> {
        this.deps.logger.debug("GetDataService run");
        return this.deps.httpClient.fetch() as Promise<AppStoreValue>;
    }
}
