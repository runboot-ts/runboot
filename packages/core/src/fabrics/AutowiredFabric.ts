import { Class } from "@oxc-project/types";
import { FabricParams, IDeps, IFabric, IFileBody, ITypeStore } from "../types";
import { DepsTypeReference } from "../DepsTypeReference";

export class AutowiredFabric implements IFabric {
    private name: string;
    private deps: DepsTypeReference | null = null;
    private fileImportPath: string;
    constructor(decl: Class, typeStore: ITypeStore, body: IFileBody) {
        this.name = decl.id?.name || "";
        this.fileImportPath = body.getFileImportPath();
        if (decl.body.type === "ClassBody" && decl.body.body.length) {
            decl.body.body.forEach(elem => {
                if (elem.type === "MethodDefinition" && elem.kind === "constructor") {
                    const paramsLength = elem.value.params.length;
                    if (paramsLength > 1) {
                        throw new Error(`Bad Autowired class arguments - ${this.name} constructor has many arguments`);
                    }

                    if (paramsLength === 1 && elem.value.params[0]) {
                        this.deps = new DepsTypeReference(elem.value.params[0], typeStore, body);
                    }
                }
            });
        }
    }

    public getKey(): string {
        return this.name;
    }

    public getDeps(): IDeps | null {
        return this.deps;
    }

    public getImports() {
        const result = this.deps?.getImports() ?? [];
        result.push({ name: this.name, path: this.fileImportPath });
        return result;
    }

    public getParams(): FabricParams {
        return {
            type: "Autowired",
            className: this.name,
        };
    }
}
