import { IFabric, IFileBody, ProviderStoreItem } from "../types";
import { formatToVarName } from "../utils";

export class ProviderStore {
    private store = new Map<string, ProviderStoreItem>();

    add(name: string, body: IFileBody) {
        if (this.store.has(name)) {
            throw new Error(`Provider ${name} already exists`);
        }

        const implClassName = `${name}Impl`;
        this.store.set(name, {
            name,
            implClassName,
            varName: formatToVarName(implClassName),
            fabrics: new Set<string>(),
            importPath: body.getFileImportPath(),
        });
    }

    addFabric(name: string, fabricKey: string) {
        const item = this.store.get(name);
        if (!item) {
            throw new Error(`Provider ${name} not exist`);
        }

        item.fabrics.add(fabricKey);
    }

    forEach(cb: (item: ProviderStoreItem) => void): void {
        this.store.forEach(cb);
    }

    findByFabricKey(fabricKey: string): ProviderStoreItem {
        for (let item of this.store.values()) {
            if (item.fabrics.has(fabricKey)) {
                return item;
            }
        }

        throw new Error(`Provider not found by key - ${fabricKey}`);
    }
}
