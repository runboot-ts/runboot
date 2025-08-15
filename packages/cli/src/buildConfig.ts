import fs from "node:fs/promises";
import { BuildConfig } from "./types";

export const buildConfig = async (configFile: string, env: string): Promise<BuildConfig> => {
    const config: BuildConfig = {
        srcDir: "./src",
        filesGlobPattern: "**/*.{ts,tsx}",
        singletonsPattern: [],
        autowiredPattern: ["(Store|Collection|Service|UseCase|Interactor)$"],
        depsPattern: ["(Deps)$"],
        providerPattern: ["(Provider)$"],
        mainFilename: "main.tsx",
        mainClass: "^AppMain",
        indentSize: 2,
        mainExport: "none",
        bootstrap: "",
        mainImports: [],
    };

    if (configFile) {
        try {
            const configFileData = JSON.parse(await fs.readFile(configFile, { encoding: "utf-8" }));
            if (configFileData && typeof configFileData === "object") {
                Object.keys(config).forEach(k => {
                    const key = k as keyof BuildConfig;

                    const originalValue = config[key];
                    const value: number | string | string[] | undefined = configFileData[key];
                    if (typeof originalValue === "string" && typeof value === "string") {
                        Object.assign(config, { [key]: value });
                        return;
                    }
                    if (typeof originalValue === "number" && typeof value === "string") {
                        Object.assign(config, { [key]: Number.parseInt(value) });
                        return;
                    }
                    if (Array.isArray(originalValue) && Array.isArray(value)) {
                        const result: (string | { name: string; path: string })[] = [];
                        value.forEach((value: unknown) => {
                            if (typeof value === "string") {
                                result.push(value);
                                return;
                            }
                            if (
                                value &&
                                typeof value === "object" &&
                                value.hasOwnProperty("name") &&
                                value.hasOwnProperty("path")
                            ) {
                                result.push(value as { name: string; path: string });
                                return;
                            }
                        });

                        Object.assign(config, { [key]: result });
                    }
                });
            }
        } catch {}
    }

    if (env) {
        try {
            const envConfigFile = JSON.parse(
                await fs.readFile(configFile.replace(/\.json$/, `.${env.toLowerCase()}.json`), { encoding: "utf-8" }),
            );
            if (envConfigFile && typeof envConfigFile === "object") {
                Object.keys(config).forEach(k => {
                    const key = k as keyof BuildConfig;
                    const originalValue = config[key];
                    const value: number | string | string[] | undefined = envConfigFile[key];
                    if (typeof originalValue === "string" && typeof value === "string") {
                        Object.assign(config, { [key]: value });
                        return;
                    }

                    if (typeof originalValue === "number" && typeof value === "string") {
                        Object.assign(config, { [key]: Number.parseInt(value) });
                        return;
                    }

                    if (Array.isArray(originalValue) && Array.isArray(value)) {
                        value.forEach((value: unknown) => {
                            if (typeof value === "string") {
                                (config[key] as string[]).push(value);
                                return;
                            }

                            if (
                                value &&
                                typeof value === "object" &&
                                value.hasOwnProperty("name") &&
                                value.hasOwnProperty("path")
                            ) {
                                (config[key] as { name: string; path: string }[]).push(
                                    value as { name: string; path: string },
                                );
                                return;
                            }
                        });
                    }
                });
            }
        } catch {}
    }

    return config as BuildConfig;
};
