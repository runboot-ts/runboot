export type DIContainerKey<T> = (abstract new (...args: any) => T) | (new (...args: any) => T);

export abstract class DIContainer {
    abstract register<T>(key: DIContainerKey<T>, fabric: () => T, isSingleton?: boolean): void;
    abstract resolve<T>(key: DIContainerKey<T>): T;
}

export type DIContainerConfigure = (container: DIContainer) => void;

export const createDIContainer = (configure?: DIContainerConfigure): DIContainer => {
    const store = new Map();
    const singletonsStore = new Map();
    const resolve = <T>(key: DIContainerKey<T>): T => {
        let instance: T | null = null;
        if (singletonsStore.has(key)) {
            instance = singletonsStore.get(key);
            if (!instance) {
                const fabric = store.get(key);
                instance = fabric();
                singletonsStore.set(key, instance);
            }
        }

        if (instance) {
            return instance;
        }

        const fabric = store.get(key);
        if (!fabric) {
            throw new Error(`Fabric not exist - ${key}`);
        }
        return fabric();
    };

    const register = <T>(key: DIContainerKey<T>, fabric: () => T, isSingleton?: boolean): void => {
        store.set(key, fabric);
        if (isSingleton) {
            singletonsStore.set(key, null);
        }
    };

    configure?.({ register, resolve });

    return {
        register,
        resolve,
    };
};
