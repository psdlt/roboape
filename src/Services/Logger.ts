export default class Logger {
    constructor(private name: string) {
    }

    public log(line: string) {
        console.log(new Date(), `[${this.name}] ${line}`);
    }

    public error(line: string, exception: any = null) {
        console.error(new Date(), `[${this.name}] ${line}`);
        if (exception) {
            console.error(exception);
        }
    }
}
