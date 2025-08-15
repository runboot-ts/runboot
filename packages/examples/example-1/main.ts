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


  const getDataServiceDeps1 = {
    get logger() {
      return resolve(LoggerService);
    },
    get httpClient() {
      return resolve(HttpClientService);
    },
  };

  register(GetDataService, () => new GetDataService(getDataServiceDeps1), true);

  register(LoggerService, () => appProviderDevImpl.provideLogger(), true);

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

  register(AppStore, () => new AppStore(), true);

  const loggerServiceDevDeps4 = {
    get container() {
      return resolve(DIContainer);
    },
  };

  register(LoggerServiceDev, () => new LoggerServiceDev(loggerServiceDevDeps4), false);

  const httpClientServiceDeps5 = {
    get logger() {
      return resolve(LoggerService);
    },
  };

  register(HttpClientService, () => new HttpClientService(httpClientServiceDeps5), true);

  register(DIContainer, () => ({ register, resolve }), true);
};


const container = createDIContainer(configure);
const main = container.resolve(AppMain);
main.configure();
main.start();