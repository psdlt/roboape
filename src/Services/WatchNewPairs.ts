import Web3 from "web3";
import {Topics} from "../Models/Topics";
import Logger from "./Logger";
import {Log} from "web3-core";
import AbiUtils from "./AbiUtils";
import {Symbols} from "../Models/Symbols";
import Ape from "./Ape";
import Web3Helper from "./Web3Helper";
import {fromWei, toWei} from "web3-utils";

export default class WatchNewPairs {
    private logger: Logger = new Logger('WatchNewPairs');
    private abiDecoder = require('abi-decoder');

    private minBalance = toWei(process.env.MIN_BALANCE);
    private minReserve = toWei(process.env.MIN_RESERVE);
    private sufficientBalance = false;

    constructor(
        private web3: Web3,
        private web3Helper: Web3Helper
    ) {
        this.abiDecoder.addABI(require('../ABIs/IPancakeFactoryV2.json'));
        this.abiDecoder.addABI(require('../ABIs/IPancakeRouterV2.json'));

        this.connect();
        this.checkBalance();
    }

    private connect() {
        this.web3.eth.subscribe('logs', {
            address: process.env.FACTORY_ADDRESS,
            topics: [Topics.PairCreated],
        })
            .on('data', (log) => {
                this.handleLogs(log).catch((e: any) => {
                    this.logger.error(`Error handling log`, e);
                });
            })
            .on('connected', () => {
                this.logger.log('Listening to logs');
            })
            .on('error', (error) => {
                this.logger.error(`Unexpected error ${error.message}`);
                this.connect();
            });
    }

    private async handleLogs(log: Log) {
        if (!this.sufficientBalance) {
            return;
        }

        const decoded = this.abiDecoder.decodeLogs([log]);
        const values = AbiUtils.decodedEventsToArray(decoded[0]);

        if (values.token0 !== Symbols.wbnb && values.token1 !== Symbols.wbnb) {
            // Non-WBNB pairs are not supported
            return;
        }

        // verify reserve
        const reserve = await this.web3Helper.getReserve(values.pair);
        const bnbReserve = values.token0 === Symbols.wbnb ? reserve.reserve0 : reserve.reserve1;

        this.logger.log(`New pair created: ${values.pair}. BNB reserve: ${fromWei(bnbReserve.toFixed())}.`);

        if (bnbReserve.lte(this.minReserve)) {
            return;
        }

        const ape = new Ape(
            this.web3Helper,
            values.pair,
            values.token0,
            values.token1,
            reserve,
        );
        ape.in();
    }

    private checkBalance() {
        this.web3Helper.accountBalance()
            .then((balance) => {
                this.logger.log(`Current account balance: ${fromWei(balance.toFixed())} BNB`);

                this.sufficientBalance = balance.gt(this.minBalance);
            })
            .catch((error) => {
                this.logger.error(`Error while checking balance: ${error.message}`);
            });

        setTimeout(() => {
            this.checkBalance();
        }, 60*1000);
    }
}
