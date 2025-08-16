import { ClassElement, TSTypeAnnotation } from "@oxc-project/types";
import { FabricParams, IDeps, IFabric, IFileBody, ImportList, ITypeItem, ITypeStore } from "../types";
import { DepsTypeReference } from "../DepsTypeReference";

export class ProviderFabric implements IFabric {
    private propertyName: string;
    private type: ITypeItem;
    private name: string;
    private implTypeName: string = "";
    private implTypePath: string = "";
    private deps: DepsTypeReference | null = null;
    private isAbstract: boolean;

    constructor(elem: ClassElement, typeStore: ITypeStore, body: IFileBody) {
        this.isAbstract = elem.type === "TSAbstractMethodDefinition";
        this.propertyName = this.getPropertyName(elem) || "";
        this.name = this.propertyName;
        const implTypeName = this.getImplTypeName(elem) || null;

        this.type = typeStore.getOrAddByTypeAnnotation(this.getReturnTypeAnnotation(elem));
        this.type.addImport(body.getImportPathByName(this.getKey()));

        if (this.isAbstract && implTypeName) {
            this.name = implTypeName;
            this.implTypeName = implTypeName;
            this.implTypePath = body.getImportPathByName(implTypeName);
        }

        let param = this.isAbstract ? this.getMethodParam(elem, 1) : this.getMethodParam(elem, 0);
        if (param) {
            this.deps = new DepsTypeReference(param, typeStore, body);
        }
    }

    public getKey(): string {
        return this.type.getKey();
    }

    public getDeps(): IDeps | null {
        return this.deps;
    }

    public getImports(): ImportList {
        const result = this.deps?.getImports() || [];
        if (this.implTypePath) {
            result.push({ name: this.implTypeName, path: this.implTypePath });
        }

        return result;
    }

    public getParams(): FabricParams {
        return {
            type: "Provider",
            isAbstract: this.isAbstract,
            propertyName: this.propertyName,
            implTypeName: this.implTypeName,
        };
    }

    private getPropertyName(elem: ClassElement) {
        if (
            (elem.type === "TSAbstractMethodDefinition" || elem.type === "MethodDefinition") &&
            elem.key.type === "Identifier"
        ) {
            return elem.key.name;
        }

        return null;
    }

    private getReturnTypeName(elem: ClassElement) {
        if (
            (elem.type === "TSAbstractMethodDefinition" || elem.type === "MethodDefinition") &&
            elem.value.returnType?.typeAnnotation.type === "TSTypeReference" &&
            elem.value.returnType?.typeAnnotation.typeName.type === "Identifier"
        ) {
            return elem.value.returnType?.typeAnnotation.typeName.name;
        }

        return null;
    }

    private getReturnTypeAnnotation(elem: ClassElement): TSTypeAnnotation {
        if (
            (elem.type === "TSAbstractMethodDefinition" || elem.type === "MethodDefinition") &&
            elem.value.returnType?.typeAnnotation.type === "TSTypeReference" &&
            elem.value.returnType?.typeAnnotation.typeName.type === "Identifier"
        ) {
            return elem.value.returnType;
        }

        throw new Error("Bad provider return type annotation");
    }

    private getImplTypeName(elem: ClassElement) {
        const implParam = this.getMethodParam(elem, 0);
        if (!implParam) {
            return null;
        }
        if (
            elem.type === "TSAbstractMethodDefinition" &&
            elem.value.type === "TSEmptyBodyFunctionExpression" &&
            elem.value.params?.length
        ) {
            const param = elem.value.params[0] as { typeAnnotation?: TSTypeAnnotation };
            if (
                param.typeAnnotation?.type &&
                param.typeAnnotation.typeAnnotation.type === "TSTypeReference" &&
                param.typeAnnotation.typeAnnotation.typeName.type === "Identifier"
            ) {
                return param.typeAnnotation.typeAnnotation.typeName.name;
            }

            return null;
        }
    }

    private getMethodParam(elem: ClassElement, idx: number) {
        if (
            (elem.type === "TSAbstractMethodDefinition" || elem.type === "MethodDefinition") &&
            (elem.value.type === "TSEmptyBodyFunctionExpression" || elem.value.type === "FunctionExpression") &&
            elem.value.params?.length
        ) {
            if (idx > elem.value.params?.length - 1) {
                return null;
            }
            return elem.value.params[idx];
        }

        return null;
    }
}
