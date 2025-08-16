import fs from "node:fs/promises";
import path from "node:path";
import { DIBuilder } from "./DIBuilder";
import { buildConfig } from "./buildConfig";
import { DIRenderer } from "./renderers/DIRenderer";
import { BuildConfig } from "./types";

export class RunbootMain {
    private builder: DIBuilder | null = null;
    private config: BuildConfig | null = null;

    constructor(
        private configFilename: string,
        private env: string,
    ) {}

    public async configure() {
        this.config = await buildConfig(this.configFilename, this.env);
        this.builder = new DIBuilder(this.config);
    }

    public async readFile(code: string) {
        await this.builder?.readFile(code);
    }

    public async commit() {
        if (!this.builder) {
            return;
        }
        const config = this.getConfig();
        const { srcDir, mainFilename } = this.getPaths();

        await fs.writeFile(
            mainFilename,
            new DIRenderer(this.builder, {
                indentSize: config.indentSize,
                srcDir,
                mainExport: config.mainExport,
                bootstrap: config.bootstrap,
            }).render(),
            "utf8",
        );
    }

    public async clear() {
        const { mainFilename } = this.getPaths();
        try {
            await fs.rm(mainFilename);
        } catch {}
    }
    public getConfig(): BuildConfig {
        if (!this.config) {
            throw new Error("RunbootMain not configure");
        }
        return this.config;
    }

    public getPaths() {
        const config = this.getConfig();
        const srcDir = path.join(path.dirname(this.configFilename), config.srcDir);
        const mainFilename = path.join(srcDir, config.mainFilename);

        return {
            srcDir,
            mainFilename,
        };
    }
}
