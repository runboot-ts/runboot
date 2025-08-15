import { Class, TSInterfaceDeclaration, TSTypeAliasDeclaration, TSTypeAnnotation } from "@oxc-project/types";

export type BuildConfig = {
    srcDir: string;
    mainClass: string;
    filesGlobPattern: string;
    mainFilename: string;
    singletonsPattern: string[];
    autowiredPattern: string[];
    depsPattern: string[];
    providerPattern: string[];
    indentSize: number;
    mainExport: "none" | "global" | "module";
    bootstrap: string;
    mainImports: { name: string; path: string }[];
};

export interface IFileBody {
    findDeclByName(name: string): Class | TSTypeAliasDeclaration | TSInterfaceDeclaration | null;
    getFileImportPath(): string;
    getImportPathByName(name: string): string;
}

export interface ITypeStore {
    getByKey(key: string): ITypeItem;
    getOrAddByTypeAnnotation(typeAnnotation: TSTypeAnnotation | Class): ITypeItem;
    getImports(): ImportList;
}

export interface ITypeItem {
    addImport(path: string): void;
    addArgumentImport(name: string, path: string): void;
    getName(): string;
    getKey(): any;
    getImports(): ImportList;
}

export type ImportList = { name: string; path: string }[];

export type FabricAutowiredParams = { type: "Autowired"; className: string };
export type FabricComponentParams = { type: "Component"; className: string };
export type FabricProviderParams = {
    type: "Provider";
    propertyName: string;
    implTypeName: string;
    isAbstract: boolean;
};

export type FabricParams = FabricAutowiredParams | FabricComponentParams | FabricProviderParams;

export interface IFabric {
    getKey(): string;
    getDeps(): IDeps | null;
    getImports(): ImportList;
    getParams(): FabricParams;
}

export interface IFabricStore {
    add(fabric: IFabric): void;
    getByKey(key: string): IFabric;
    getImports(): ImportList;
    forEach(cb: (fabric: IFabric) => void): void;
}

export interface IDeps {
    getImports(): ImportList;
    getVarName(): string;
    forEach(cb: (propertyName: string, typeKey: string) => void): void;
}

export type ProviderStoreItem = {
    name: string;
    importPath: string;
    fabrics: Set<string>;
    implClassName: string;
    varName: string;
};
