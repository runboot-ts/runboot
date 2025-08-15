import { createContext } from "react";
import { createDIContainer } from "@runboot/di";

export const DIContainerContext = createContext(createDIContainer());
