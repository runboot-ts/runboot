import { IDeps, IFileBody, ImportList, ITypeItem, ITypeStore } from "./types";
import {
    BindingIdentifier,
    Class,
    PropertyDefinition,
    PropertyKey,
    TSTypeName,
    TSTypeAnnotation,
} from "@oxc-project/types";
import { formatToVarName, getCountId } from "./utils";

export class Component implements IDeps {
    private name: string;
    private items: Record<string, string> = {};
    private id = getCountId();
    private type: ITypeItem;

    constructor(
        decl: Class,
        private typeStore: ITypeStore,
        body: IFileBody,
    ) {
        this.name = this.getIdName(decl.id);
        this.type = this.typeStore.getOrAddByTypeAnnotation(decl);
        this.type.addImport(body.getFileImportPath());

        decl.body.body.forEach(item => {
            if (item.type === "TSAbstractPropertyDefinition") {
                const propertyName = this.getIdName(item.key);
                const typeAnnotation = this.getClassElementTypeAnnotation(item);
                const typeItem = typeStore.getOrAddByTypeAnnotation(typeAnnotation);
                typeItem.addImport(body.getImportPathByName(typeItem.getKey()));
                this.items[propertyName] = typeItem.getKey();
            }
        });
    }

    public getKey(): string {
        return this.name;
    }

    public getVarName() {
        return `${formatToVarName(this.name)}${this.id}`;
    }

    public getImports(): ImportList {
        const result: ImportList = [];
        Object.values(this.items).forEach(key => {
            result.push(...this.typeStore.getByKey(key).getImports());
        });
        result.push(...this.type.getImports());

        return result;
    }

    public forEach(cb: (propertyName: string, typeKey: string) => void) {
        Object.entries(this.items).forEach(([key, val]) => cb(key, val));
    }

    private getIdName(item: PropertyKey | BindingIdentifier | TSTypeName | null): string {
        return item?.type === "Identifier" ? item.name : "";
    }

    private getClassElementTypeAnnotation(decl: PropertyDefinition): TSTypeAnnotation {
        const typeAnnotation = decl.typeAnnotation;
        if (!typeAnnotation || typeAnnotation.type !== "TSTypeAnnotation") {
            throw new Error("Bad deps component property type annotation");
        }

        return typeAnnotation;
    }
}
