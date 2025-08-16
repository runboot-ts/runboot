import { FileBody } from "./FileBody";
import { BuildConfig, FabricProviderParams, IFabric, ITypeItem, ProviderStoreItem } from "./types";
import { AutowiredFabric } from "./fabrics/AutowiredFabric";
import { TypeStore } from "./stores/TypeStore";
import { ProviderFabric } from "./fabrics/ProviderFabric";
import { FabricStore } from "./stores/FabricStore";
import { ProviderStore } from "./stores/ProviderStore";
import { ComponentFabric } from "./fabrics/ComponentFabric";

export class DIBuilder {
    private typeStore = new TypeStore();
    private fabricStore = new FabricStore();
    private providerStore = new ProviderStore();
    private mainKey = "";
    constructor(private buildConfig: BuildConfig) {}

    public async readFile(filename: string) {
        const body = new FileBody(filename);
        await body.read();

        body.forEachDecl(decl => {
            const name = decl.id?.name;
            if (!name) {
                return;
            }

            const isMain = this.isMain(name);
            if ((this.isAutowired(name) || isMain) && decl.type === "ClassDeclaration" && !decl.abstract) {
                const fabric = new AutowiredFabric(decl, this.typeStore, body);
                this.fabricStore.add(fabric);
                if (isMain) {
                    this.mainKey = fabric.getKey();
                }
                return;
            }

            if (this.isProvider(name)) {
                if (decl.type === "ClassDeclaration") {
                    const name = decl.id?.name || "";
                    this.providerStore.add(name, body);
                    decl.body.body.forEach(elem => {
                        const fabric = new ProviderFabric(elem, this.typeStore, body);
                        this.fabricStore.add(fabric);
                        this.providerStore.addFabric(name, fabric.getKey());
                    });
                }

                return;
            }

            if (this.isDeps(name) && decl.type === "ClassDeclaration" && decl.abstract) {
                const fabric = new ComponentFabric(decl, this.typeStore, body);
                this.fabricStore.add(fabric);

                return;
            }
        });

        body.destroy();
    }

    public getImports() {
        let result: Record<string, string> = {};
        const registerImport = (name: string, path: string) => {
            if (!result[name]) {
                result[name] = path;
            }

            if (result[name].length >= path.length) {
                result[name] = path;
            }
        };

        this.fabricStore.getImports().forEach(elem => {
            registerImport(elem.name, elem.path);
        });

        this.typeStore.getImports().forEach(elem => {
            registerImport(elem.name, elem.path);
        });

        this.providerStore.forEach(elem => {
            registerImport(elem.name, elem.importPath);
        });

        registerImport("DIContainer", "@runboot/di");
        registerImport("createDIContainer", "@runboot/di");
        this.buildConfig.mainImports.forEach(item => {
            registerImport(item.name, item.path);
        });
        return result;
    }

    public forEachFabric(cb: (fabric: IFabric) => void) {
        this.fabricStore.forEach(cb);
    }

    public forEachProvider(cb: (provider: ProviderStoreItem) => void) {
        this.providerStore.forEach(cb);
    }

    public getProviderFabricParamsByKey(key: string): FabricProviderParams {
        return this.fabricStore.getByKey(key).getParams() as FabricProviderParams;
    }

    public getFabricByKey(key: string): IFabric | null {
        try {
            return this.fabricStore.getByKey(key);
        } catch {
            return null;
        }
    }

    public getTypeByKey(key: string): ITypeItem {
        return this.typeStore.getByKey(key);
    }

    public isTypeExist(key: string) {
        try {
            this.typeStore.getByKey(key);
            return true;
        } catch {
            return false;
        }
    }

    public getProviderByFabricKey(key: string) {
        return this.providerStore.findByFabricKey(key);
    }

    private isAutowired(name: string): boolean {
        return this.buildConfig.autowiredPattern.some(pattern => {
            return new RegExp(pattern).test(name);
        });
    }

    private isMain(name: string) {
        return new RegExp(this.buildConfig.mainClass).test(name);
    }

    private isProvider(name: string): boolean {
        return this.buildConfig.providerPattern.some(pattern => {
            return new RegExp(pattern).test(name);
        });
    }

    private isDeps(name: string): boolean {
        return this.buildConfig.depsPattern.some(pattern => {
            return new RegExp(pattern).test(name);
        });
    }

    public isSingleton(name: string): boolean {
        return this.buildConfig.singletonsPattern.some(pattern => {
            return new RegExp(pattern).test(name);
        });
    }

    public getMainKey() {
        return this.mainKey;
    }
}
