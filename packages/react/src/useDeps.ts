import { useContext } from "react";
import { DIContainerContext } from "./DIContainerContext";

export type AbstractDeps<T> = abstract new (...args: any) => T;

export function useDeps<T>(deps: AbstractDeps<T>): T {
    return useContext(DIContainerContext).resolve<T>(deps);
}
