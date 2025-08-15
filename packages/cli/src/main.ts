import { program, Command } from "commander";
import { runDIParser } from "./run";

export async function main() {
    const di = new Command("build");

    di.option("-e <string>", "set environment")
        .argument("package config file")
        .action(async (args, opts) => {
            console.log("Runboot build...");
            await runDIParser({ configFile: args, env: String(opts.e || "") });
        });

    program.addCommand(di);

    await program.parseAsync(process.argv);
}
