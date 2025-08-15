import {
    ParamPattern,
    TSInterfaceDeclaration,
    TSSignature,
    TSTypeAliasDeclaration,
    TSTypeAnnotation,
} from "@oxc-project/types";
import { IDeps, IFileBody, ImportList, ITypeStore } from "./types";
import { formatToVarName, getCountId } from "./utils";

export class DepsTypeReference implements IDeps {
    private items: Record<string, string> = {};
    private id = getCountId();
    private name: string;
    private paramName: string;

    constructor(
        decl: ParamPattern,
        private typeStore: ITypeStore,
        body: IFileBody,
    ) {
        const paramTypeAnnotation = this.getParamTypeAnnotation(decl);
        if (!paramTypeAnnotation) {
            throw new Error("Bad DepsTypeReference type annotation");
        }

        const type = this.getParamTypeNameByAnnotation(paramTypeAnnotation);
        this.name = (type ? type.name : paramTypeAnnotation.typeAnnotation.type) || "Unknown";
        this.paramName = this.getParamName(decl);
        let members: TSSignature[] = [];
        if (type) {
            const deps = body.findDeclByName(this.name);
            if (deps?.type === "TSTypeAliasDeclaration") {
                members = this.getMembers(deps);
            }
        }

        if (!type && paramTypeAnnotation.typeAnnotation.type === "TSTypeLiteral") {
            members = paramTypeAnnotation.typeAnnotation.members;
        }

        if (!members.length) {
            return;
        }

        this.items = this.parseDepsMembers(members, typeStore, body);
    }

    public getImports(): ImportList {
        return Object.values(this.items)
            .map(key => this.typeStore.getByKey(key))
            .reduce((acc, curr) => {
                return acc.concat(curr.getImports());
            }, [] as ImportList);
    }

    public getVarName() {
        return `${formatToVarName(this.name)}${this.id}`;
    }

    public forEach(cb: (propertyName: string, typeKey: string) => void) {
        Object.entries(this.items).forEach(([key, val]) => cb(key, val));
    }

    private fromParam(decl: ParamPattern, typeStore: ITypeStore, body: IFileBody) {}

    private getParamName(param: ParamPattern) {
        if (param.type === "TSParameterProperty" && param.parameter.type === "Identifier") {
            return param.parameter.name || "deps";
        }

        return "deps";
    }

    private getParamTypeAnnotation(param: ParamPattern) {
        let result: TSTypeAnnotation | null = null;

        if (
            param.type === "TSParameterProperty" &&
            param.parameter.type === "Identifier" &&
            param.parameter.typeAnnotation
        ) {
            result = param.parameter.typeAnnotation as TSTypeAnnotation;
        }

        if (
            !result &&
            param.type === "Identifier" &&
            (param as { typeAnnotation: TSTypeAnnotation }).typeAnnotation.type === "TSTypeAnnotation"
        ) {
            result = param.typeAnnotation || null;
        }

        if (!result) {
            throw new Error("Bad param type annotation");
        }

        return result;
    }

    private getParamTypeNameByAnnotation(typeAnnotation: TSTypeAnnotation) {
        if (
            typeAnnotation.typeAnnotation.type === "TSTypeReference" &&
            typeAnnotation.typeAnnotation.typeName.type === "Identifier"
        ) {
            return typeAnnotation.typeAnnotation.typeName;
        }

        return null;
    }

    private parseDepsMembers(members: TSSignature[], typeStore: ITypeStore, body: IFileBody) {
        const result: Record<string, string> = {};

        members.forEach(member => {
            const propName = this.getMemberName(member);

            const typeAnnotation = this.getMemberTypeAnnotation(member);
            const typeItem = typeStore.getOrAddByTypeAnnotation(typeAnnotation);
            const importValue = body.getImportPathByName(typeItem.getName());
            typeItem.addImport(importValue);
            result[propName] = typeItem.getKey();
        });

        return result;
    }

    private getMembers(decl: TSTypeAliasDeclaration | TSInterfaceDeclaration): TSSignature[] {
        if (decl?.type === "TSTypeAliasDeclaration" && decl?.typeAnnotation.type === "TSTypeLiteral") {
            return decl.typeAnnotation.members;
        }

        return [];
    }

    private getMemberName(member: TSSignature): string {
        if (member.type !== "TSPropertySignature" || member.key.type !== "Identifier") {
            throw new Error("Bad deps property signature");
        }

        return member.key.name;
    }

    private getMemberTypeAnnotation(member: TSSignature): TSTypeAnnotation {
        if (member.type !== "TSPropertySignature" || member.typeAnnotation?.type !== "TSTypeAnnotation") {
            throw new Error("Bad deps property type");
        }

        return member.typeAnnotation;
    }
}
