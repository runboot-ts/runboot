import {AppMain} from "./AppMain";
import {DIContainer} from "@runboot/di";
import {AppStore} from "./stores/AppStore";
import {createDIContainer} from "@runboot/di";
import {LoggerService} from "./infra/LoggerService";
import {GetDataService} from "./services/GetDataService";
import {AppProviderDev} from "./providers/AppProviderDev";
import {HttpClientService} from "./infra/HttpClientService";
import {DoSomethingUseCase} from "./usecases/DoSomethingUseCase";

class AppProviderDevImpl extends AppProviderDev {

}
const appProviderDevImpl = new AppProviderDevImpl();


export const configure = ({ register, resolve }: DIContainer) => {
  register(AppStore, () => new AppStore(), true);

  const getDataServiceDeps1 = {
    get logger() {
      return resolve(LoggerService);
    },
    get httpClient() {
      return resolve(HttpClientService);
    },
  };

  register(GetDataService, () => new GetDataService(getDataServiceDeps1), true);

  const doSomethingUseCaseDeps2 = {
    get dataService() {
      return resolve(GetDataService);
    },
    get appStore() {
      return resolve(AppStore);
    },
    get logger() {
      return resolve(LoggerService);
    },
  };

  register(DoSomethingUseCase, () => new DoSomethingUseCase(doSomethingUseCaseDeps2), false);

  register(LoggerService, () => appProviderDevImpl.provideLogger(), true);

  const mainAppDeps3 = {
    get doSomethingUseCase() {
      return resolve(DoSomethingUseCase);
    },
    get logger() {
      return resolve(LoggerService);
    },
    get depsContainer() {
      return resolve(DIContainer);
    },
  };

  register(AppMain, () => new AppMain(mainAppDeps3), false);

  const httpClientServiceDeps4 = {
    get logger() {
      return resolve(LoggerService);
    },
  };

  register(HttpClientService, () => new HttpClientService(httpClientServiceDeps4), true);

  register(DIContainer, () => ({ register, resolve }), true);
};


const container = createDIContainer(configure);
const main = container.resolve(AppMain);
main.configure();
main.start();