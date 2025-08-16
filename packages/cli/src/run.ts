import path from "node:path";
import { glob } from "glob";
import { RunbootMain } from "@runboot/core";

export const runDIParser = async ({ configFile, env }: { configFile: string; env: string }) => {
    console.log("Configure app...", configFile, env);
    const main = new RunbootMain(configFile, env);
    await main.configure();

    let config = main.getConfig();
    const { srcDir, mainFilename } = main.getPaths();
    const globPattern = path.join(srcDir, config.filesGlobPattern);
    const tasks: Promise<void>[] = [];

    for await (const entry of await glob(globPattern)) {
        tasks.push(main.readFile(entry));
    }

    await Promise.all(tasks);

    await main.clear();
    await main.commit();
};
