import {AppMain} from "./AppMain";
import {DIContainer} from "@runboot/di";
import {AppStore} from "./stores/AppStore";
import {createDIContainer} from "@runboot/di";
import {LoggerService} from "./infra/LoggerService";
import {GetDataService} from "./services/GetDataService";
import {LoggerServiceDev} from "./infra/LoggerServiceDev";
import {AppProviderDev} from "./providers/AppProviderDev";
import {HttpClientService} from "./infra/HttpClientService";
import {DoSomethingUseCase} from "./usecases/DoSomethingUseCase";

export const configure = ({ register, resolve }: DIContainer) => {
  class AppProviderDevImpl extends AppProviderDev {
    provideLogger() {
      return resolve(LoggerServiceDev);
    }
  }
  const appProviderDevImpl = new AppProviderDevImpl();


  register(AppStore, () => new AppStore(), true);

  register(LoggerService, () => appProviderDevImpl.provideLogger(), true);

  const doSomethingUseCaseDeps1 = {
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

  register(DoSomethingUseCase, () => new DoSomethingUseCase(doSomethingUseCaseDeps1), false);

  const getDataServiceDeps2 = {
    get logger() {
      return resolve(LoggerService);
    },
    get httpClient() {
      return resolve(HttpClientService);
    },
  };

  register(GetDataService, () => new GetDataService(getDataServiceDeps2), true);

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

  const loggerServiceDevDeps5 = {
    get container() {
      return resolve(DIContainer);
    },
  };

  register(LoggerServiceDev, () => new LoggerServiceDev(loggerServiceDevDeps5), false);

  register(DIContainer, () => ({ register, resolve }), true);
};


const container = createDIContainer(configure);
const main = container.resolve(AppMain);
main.configure();
main.start();