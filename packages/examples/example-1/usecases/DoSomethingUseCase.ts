import { GetDataService } from "../services/GetDataService";
import { AppStore } from "../stores/AppStore";
import { LoggerService } from "../infra/LoggerService";

export type DoSomethingUseCaseDeps = {
    dataService: GetDataService;
    appStore: AppStore;
    logger: LoggerService;
};

export class DoSomethingUseCase {
    constructor(private deps: DoSomethingUseCaseDeps) {}
    public async execute() {
        this.deps.logger.log("DoSomethingUseCase execute");
        const data = await this.deps.dataService.execute();
        this.deps.appStore.setDate(data);
        this.deps.logger.log(`DoSomethingUseCase store data: ${JSON.stringify(this.deps.appStore.getDate())}`);
    }
}
