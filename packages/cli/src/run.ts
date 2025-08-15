import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import { buildConfig } from "./buildConfig";
import { DIBuilder } from "./DIBuilder";
import { DIRenderer } from "./renderers/DIRenderer";

export const runDIParser = async ({ configFile, env }: { configFile: string; env: string }) => {
    console.log("Configure app...", configFile, env);
    let config = await buildConfig(configFile, env);

    const srcDir = path.join(path.dirname(configFile), config.srcDir);
    const globPattern = path.join(srcDir, config.filesGlobPattern);
    const configureFilename = path.join(srcDir, config.mainFilename);
    const tasks: Promise<void>[] = [];
    const diBuilder = new DIBuilder(config);

    for await (const entry of await glob(globPattern)) {
        tasks.push(diBuilder.readFile(entry));
    }

    await Promise.all(tasks);

    try {
        await fs.rm(configureFilename);
    } catch {}

    await fs.writeFile(
        configureFilename,
        new DIRenderer(diBuilder, {
            indentSize: config.indentSize,
            srcDir,
            mainExport: config.mainExport,
            bootstrap: config.bootstrap,
        }).render(),
        "utf8",
    );
};
