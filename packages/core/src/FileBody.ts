import fs from "node:fs/promises";
import path from "node:path";
import oxc, { ParseResult } from "oxc-parser";
import { Class, Directive, Statement, TSInterfaceDeclaration, TSTypeAliasDeclaration } from "@oxc-project/types";

interface IFileBody {
    findDeclByName(name: string): Class | TSTypeAliasDeclaration | TSInterfaceDeclaration | null;
    getFileImportPath(): string;
    getImportPathByName(name: string): string;
}

export class FileBody implements IFileBody {
    private result: ParseResult | null = null;
    constructor(private filename: string) {}

    async read(): Promise<void> {
        const code = await fs.readFile(this.filename, { encoding: "utf-8" });
        const result = await oxc.parseAsync(this.filename, code, {});

        this.result = result;
    }

    private visitBodyRow(
        row: Directive | Statement | null,
        cb: (decl: Class | TSTypeAliasDeclaration | TSInterfaceDeclaration) => void,
    ) {
        if (!row) {
            return;
        }
        switch (row.type) {
            case "TSTypeAliasDeclaration":
            case "ClassDeclaration":
            case "TSInterfaceDeclaration":
                cb(row);
                return;
            case "ExportNamedDeclaration":
                this.visitBodyRow(row.declaration, cb);
        }
    }

    forEachDecl(cb: (decl: Class | TSTypeAliasDeclaration | TSInterfaceDeclaration) => void) {
        this.result?.program.body.forEach(row => {
            this.visitBodyRow(row, cb);
        });
    }

    findDeclByName(name: string): Class | TSTypeAliasDeclaration | TSInterfaceDeclaration | null {
        let decl: Class | TSTypeAliasDeclaration | TSInterfaceDeclaration | null = null;
        this.result?.program.body.some(row => {
            this.visitBodyRow(row, item => {
                if (item.id?.name === name) {
                    decl = item;
                }
            });
            return !!decl;
        });

        return decl;
    }

    getFileImportPath(): string {
        return this.filename.replace(/.tsx?$/, "");
    }

    getImportPathByName(name: string): string {
        const importItem = this.result?.module.staticImports.find(importDecl => {
            return importDecl.entries.find(i => {
                return i.importName.name === name;
            });
        });

        let importPath = importItem?.moduleRequest.value || "";
        if (importPath.match(/^\./)) {
            importPath = path.join(path.dirname(this.filename), importPath);
        }

        return importPath;
    }

    destroy() {
        this.result = null;
        this.filename = "";
    }
}
