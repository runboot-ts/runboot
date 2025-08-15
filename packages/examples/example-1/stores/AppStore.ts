export type AppStoreValue = {
    foo: string;
};
export class AppStore {
    private data: AppStoreValue | null = null;
    setDate(data: AppStoreValue) {
        this.data = data;
    }

    getDate(): AppStoreValue | null {
        return this.data;
    }
}
