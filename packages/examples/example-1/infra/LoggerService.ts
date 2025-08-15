export abstract class LoggerService {
    public abstract log(message: string): void;
    public abstract debug(message: string): void;
}
