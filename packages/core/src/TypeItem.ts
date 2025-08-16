import { TSTypeAnnotation, Class } from "@oxc-project/types";
import { ImportList, ITypeItem } from "./types";

export class TypeItem implements ITypeItem {
    public name: string;
    public importPaths: string[] = [];

    constructor(typeAnnotation: TSTypeAnnotation | Class) {
        if (typeAnnotation.type === "ClassExpression") {
            throw new Error("Class Expression not supported");
        }

        if (typeAnnotation.type === "ClassDeclaration") {
            this.name = typeAnnotation.id?.name || "";
            return;
        }

        if (
            typeAnnotation.type !== "TSTypeAnnotation" ||
            typeAnnotation.typeAnnotation.type !== "TSTypeReference" ||
            typeAnnotation.typeAnnotation.typeName.type !== "Identifier"
        ) {
            throw new Error("Invalid TypeAnnotation");
        }

        this.name = typeAnnotation.typeAnnotation.typeName.name;
        if (typeAnnotation.typeAnnotation.typeArguments?.params?.length) {
            throw new Error("Not supported generic type yet");
        }
    }

    addImport(path: string): void {
        this.importPaths.push(path);
    }

    addArgumentImport(name: string, path: string): void {
        // TODO: not implemented
    }

    getName(): string {
        return this.name;
    }

    getKey() {
        return this.name;
    }

    getImports(): ImportList {
        return [{ name: this.name, path: this.getShortImportPath() }];
    }

    private getShortImportPath(): string {
        let result = "";
        this.importPaths.forEach((path, idx) => {
            if (!idx) {
                result = path;
                return;
            }

            if (path.length <= result.length) {
                result = path;
            }
        });

        return result;
    }
}
