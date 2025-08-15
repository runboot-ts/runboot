import { DoSomethingUseCase } from "./usecases/DoSomethingUseCase";
import { DIContainer } from "@runboot/di";
import { LoggerService } from "./infra/LoggerService";

type MainAppDeps = {
    doSomethingUseCase: DoSomethingUseCase;
    logger: LoggerService;
    depsContainer: DIContainer;
};

export class AppMain {
    constructor(private deps: MainAppDeps) {}

    configure() {
        this.deps.logger.log(`Running App Main`);
    }

    async start() {
        await this.deps.doSomethingUseCase.execute();
    }
}
