export abstract class Renderer {
    constructor(private renderConfig?: { indent?: number; indentSize?: number }) {}

    private getConfig() {
        return {
            indent: this.renderConfig?.indent ?? 0,
            indentSize: this.renderConfig?.indentSize ?? 2,
        };
    }

    protected indent(value: number) {
        return " ".repeat(this.getConfig().indentSize).repeat(value + this.getConfig().indent);
    }
}
