import { IFabric, IFabricStore, ImportList } from "../types";

export class FabricStore implements IFabricStore {
    private store = new Map<string, IFabric>();

    public add(fabric: IFabric): void {
        this.store.set(fabric.getKey(), fabric);
    }

    public getByKey(key: string): IFabric {
        const result = this.store.get(key);
        if (!result) {
            throw new Error(`Fabric ${key} not exist`);
        }

        return result;
    }

    public forEach(cb: (fabric: IFabric) => void): void {
        this.store.forEach(cb);
    }

    public getImports(): ImportList {
        let result: ImportList = [];
        this.store.forEach(item => {
            result = result.concat(item.getImports());
        });

        return result;
    }
}
