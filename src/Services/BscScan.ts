import Logger from "./Logger";
import axios, {AxiosResponse} from "axios";

export default class BscScan {
    private logger: Logger = new Logger('BscScan');

    private offendingWords: string[] = [
        'Handling Request',
        'require(txoo && !bl[msg.sender])',
        'FOR VALUE PROTECTION, YOU CAN ONLY SELL',
        'Syntax Error. Please Re-Submit Order',
        'Error: Can not sell this token',
        'SLAVETAX',
        '"please wait"',
        '"Not you"',
        'account is freez',
        'Transaction amount exceeds the configured limit',
        'Tokens cannot be transferred',
        'sefhi = 2 weeks',
        '"Tokens are here"',
        '[account] = 1;',
    ];

    public isGoodToken(token: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            if (process.env.BSSCAN_CHECK !== 'true') {
                resolve(true);
                return;
            }

            if (!process.env.BSCSCAN_API_KEY) {
                this.logger.error('BSCSCAN_API_KEY not set')
                process.exit(0);
            }

            let response: AxiosResponse = null;
            try {
                response = await axios.get(`https://api.bscscan.com/api?module=contract&action=getsourcecode&address=${token.toLowerCase()}&apikey=${process.env.BSCSCAN_API_KEY}`);
            } catch (e) {
                this.logger.error(`Error while testing ${token}`, e);
                reject(false);
                return;
            }

            if (response.data.message === 'OK') {
                for (const sourceObj of response.data.result) {
                    if (!sourceObj.SourceCode) {
                        if (process.env.BSSCAN_ALLOW_UNVERIFIED_TOKENS === 'true') {
                            resolve(true);
                            return;
                        }

                        this.logger.log(`${token} not verified`);
                        reject(false);
                        return;
                    }

                    for (const word of this.offendingWords) {
                        if (sourceObj.SourceCode.indexOf(word) !== -1) {
                            this.logger.log(`${token} contains "${word}" - a big no-no!`);
                            reject(false);
                            return;
                        }
                    }
                }

                resolve(true);
            }

            if (process.env.BSSCAN_ALLOW_UNVERIFIED_TOKENS === 'true') {
                resolve(true);
                return;
            }

            if (response.data.message === 'NOTOK' && response.data.result === 'Contract source code not verified') {
                this.logger.log(`${token} not verified`);
                reject(false);
                return;
            }

            reject(false);
        });
    }
}
