import { DIBuilder } from "../DIBuilder";
import { BuildConfig, IDeps, IFabric } from "../types";
import { Renderer } from "./Renderer";

export class DIRenderer extends Renderer {
    constructor(
        private builder: DIBuilder,
        private config: Pick<BuildConfig, "srcDir" | "mainExport" | "indentSize" | "bootstrap">,
    ) {
        super({
            indentSize: config.indentSize,
        });
    }

    public render() {
        const result: string[] = [];
        result.push(this.renderImports());
        result.push(this.wrapFabrics([this.renderProviders(), this.renderFabrics()].join("\n\n")));
        result.push(this.renderBootstrap());
        return result.join("\n\n");
    }

    private wrapFabrics(text: string): string {
        return `export const configure = ({ register, resolve }: DIContainer) => {\n${text}\n};\n`;
    }

    private renderImports(): string {
        const result: string[] = [];
        Object.entries(this.builder.getImports()).forEach(([name, path]) => {
            result.push(`import {${name}} from "${path.replace(this.config.srcDir, ".")}";`);
        });

        return result.sort((a, b) => a.length - b.length).join("\n");
    }

    private renderProviders(): string {
        const result: string[] = [];

        this.builder.forEachProvider(provider => {
            const leader = `${this.indent(1)}class ${provider.implClassName} extends ${provider.name} {\n`;
            let body = "";
            const trailer = `${this.indent(1)}}`;
            const properties: string[] = [];

            provider.fabrics.forEach(key => {
                const params = this.builder.getProviderFabricParamsByKey(key);
                if (params.isAbstract && params.implTypeName) {
                    const fabric = this.builder.getFabricByKey(params.implTypeName);

                    const resolve = fabric ? `resolve(${fabric.getKey()})` : `new ${params.implTypeName}()`;
                    const property = `${this.indent(2)}${params.propertyName}() {\n${this.indent(3)}return ${resolve};\n${this.indent(2)}}`;
                    properties.push(property);
                }
            });
            body += properties.join("\n") + "\n";
            const instance = `${this.indent(1)}const ${provider.varName} = new ${provider.implClassName}();\n`;
            result.push(`${leader}${body}${trailer}\n${instance}`);
        });

        return result.join("\n\n");
    }

    private renderFabrics(): string {
        const result: string[] = [];
        this.builder.forEachFabric(fabric => {
            result.push(...this.renderFabric(fabric));
        });

        result.push(`${this.indent(1)}register(DIContainer, () => ({ register, resolve }), true);`);
        return result.join("\n");
    }

    private renderFabric(fabric: IFabric): string[] {
        const result: string[] = [];
        const params = fabric.getParams();
        const deps = fabric.getDeps();
        let depsVarName = "";
        if (deps) {
            const depsResult = this.renderDeps(deps);
            result.push(depsResult.text);
            depsVarName = depsResult.varName;
        }

        switch (params.type) {
            case "Autowired":
                const isSingleton = this.builder.isSingleton(params.className) ? "true" : "false";
                result.push(
                    `${this.indent(1)}register(${params.className}, () => new ${params.className}(${depsVarName ? `${depsVarName}` : ""}), ${isSingleton});\n`,
                );
                break;
            case "Component": {
                if (!depsVarName) {
                    throw new Error(`Invalid component ${params.className} - variable name not defined`);
                }
                result.push(`${this.indent(1)}register(${params.className}, () => ${depsVarName});\n`);
                break;
            }
            case "Provider": {
                const provider = this.builder.getProviderByFabricKey(fabric.getKey());
                const type = this.builder.getTypeByKey(fabric.getKey());
                const typeName = type.getName();
                const isSingleton = this.builder.isSingleton(typeName) ? "true" : "false";
                result.push(
                    `${this.indent(1)}register(${typeName}, () => ${provider.varName}.${params.propertyName}(${depsVarName}), ${isSingleton});\n`,
                );
                break;
            }
        }

        return result;
    }

    private renderDeps(deps: IDeps) {
        const varName = deps.getVarName();
        const leader = `${this.indent(1)}const ${varName} = {\n`;
        let body = "";
        deps.forEach((propertyName, typeKey) => {
            const type = this.builder.getTypeByKey(typeKey);
            body += `${this.indent(2)}get ${propertyName}() {\n${this.indent(3)}return resolve(${type.getName()});\n${this.indent(2)}},\n`;
        });
        const trailer = `${this.indent(1)}};\n`;
        return {
            varName,
            text: `${leader}${body}${trailer}`,
        };
    }

    private renderBootstrap(): string {
        const result: string[] = [];
        const mainKey = this.builder.getMainKey();
        const hasExport = this.config.mainExport === "module";
        result.push(`const container = createDIContainer(configure);`);
        result.push(`${hasExport ? "export " : ""}const main = container.resolve(${mainKey});`);
        result.push(`main.configure();`);

        if (this.config.mainExport === "global") {
            result.push(`Object.assign(window, { RunBootAppMain: main });`);
        }
        if (this.config.bootstrap) {
            result.push(this.config.bootstrap);
        }

        return result.join("\n");
    }
}
