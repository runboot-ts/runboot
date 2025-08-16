import { TSTypeAnnotation } from "@oxc-project/types";
import { ImportList, ITypeItem, ITypeStore } from "../types";
import { TypeItem } from "../TypeItem";

export class TypeStore implements ITypeStore {
    private store = new Map<string, ITypeItem>();

    public getOrAddByTypeAnnotation(typeAnnotation: TSTypeAnnotation): ITypeItem {
        const typeItem = new TypeItem(typeAnnotation);
        const prevItem = this.store.get(typeItem.getKey());
        if (prevItem) {
            return prevItem;
        }

        this.store.set(typeItem.getKey(), typeItem);
        return typeItem;
    }

    public getByKey(key: string): ITypeItem {
        const item = this.store.get(key);
        if (!item) {
            throw new Error(`TypeStore - key ${key} not found`);
        }

        return item;
    }

    public getImports(): ImportList {
        let result: ImportList = [];
        this.store.forEach(item => {
            result = result.concat(item.getImports());
        });

        return result;
    }
}
