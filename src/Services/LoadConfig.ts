import * as fs from "fs";
import * as dotenv from "dotenv";

export default class LoadConfig {
    constructor() {
        const path = fs.existsSync('.env') ? '.env' : '../.env';

        if (!fs.existsSync(path)) {
            console.error('.env file does not exist');
            process.exit(1);
        }

        dotenv.config({
            path,
        });
    }
}
