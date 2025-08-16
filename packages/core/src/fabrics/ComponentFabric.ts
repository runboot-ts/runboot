import { FabricParams, IDeps, IFileBody, ImportList, ITypeStore } from "../types";
import { Class } from "@oxc-project/types";
import { Component } from "../Component";

export class ComponentFabric {
    private component: Component;

    constructor(
        decl: Class,
        private typeStore: ITypeStore,
        body: IFileBody,
    ) {
        this.component = new Component(decl, typeStore, body);
    }

    public getKey(): string {
        return this.component.getKey();
    }

    public getDeps(): IDeps | null {
        return this.component;
    }

    public getImports(): ImportList {
        return this.component.getImports();
    }

    public getParams(): FabricParams {
        return {
            type: "Component",
            className: this.component.getKey(),
        };
    }
}
