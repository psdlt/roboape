import Web3Helper from "./Web3Helper";
import BigNumber from "bignumber.js";
import {PositionModel} from "../Entities/Position";
import Logger from "./Logger";
import {fromWei, toWei} from "web3-utils";
import {GasEstimates} from "../Models/GasEstimates";
import {Symbols} from "../Models/Symbols";

export default class AutoSell
{
    private enabled = process.env.AUTOSELL_PROFITABLE === 'true';
    private minProfit = new BigNumber(toWei(process.env.AUTOSELL_MIN_PROFIT));
    private sellPercentage: number = Number(process.env.AUTOSELL_PERCENTAGE);
    private defaultGas = toWei(process.env.GAS_PRICE, 'gwei');
    private estimatedTxnFees: BigNumber = null;

    private logger = new Logger('AutoSell');

    constructor(
        private web3Helper: Web3Helper
    ) {
        this.estimatedTxnFees = new BigNumber(GasEstimates.approve).multipliedBy(this.defaultGas).plus(
            new BigNumber(GasEstimates.swap).multipliedBy(this.defaultGas),
        );
    }

    public sellIfProfitable(position: PositionModel, dumpAll: boolean = false)
    {
        if (!this.enabled) {
            return;
        }

        const sellPercentage = dumpAll ? 100 : this.sellPercentage;

        const expectedProceeds = new BigNumber(position.profitLoss)
            .multipliedBy(sellPercentage)
            .dividedBy(100)
            .minus(this.estimatedTxnFees);

        const minProfit = position.soldFor ? new BigNumber(position.soldFor) : this.minProfit;

        if (!dumpAll && expectedProceeds.lt(minProfit)) {
            return;
        }

        this.sell(position, sellPercentage, dumpAll)
            .catch((error) => {
                this.logger.log(`Error while selling ${position.pair}: ${error.message}`);
            })
    }

    private async sell(position: PositionModel, sellPercentage: number, dumpAll: boolean) {
        const token = position.token0 === Symbols.wbnb ? position.token1 : position.token0;

        if (!position.approved) {
            await this.web3Helper.approve(token, '-1');
        }

        const sellTokens = new BigNumber(position.tokenRemaining).multipliedBy(sellPercentage).dividedBy(100).integerValue();
        try {
            const sold = await this.web3Helper.swapExactTokensForETHSupportingFeeOnTransferTokens(token, sellTokens.toFixed());
            const remainder = await this.web3Helper.balanceOf(token);
            const previousSoldFor = new BigNumber(position.soldFor ?? 0);
            const totalSoldFor = previousSoldFor.plus(sold);

            if (sellPercentage === 100) {
                await position.update({
                    tokenRemaining: remainder.toFixed(),
                    soldFor: totalSoldFor.toFixed(),
                    approved: true,
                    closedAt: new Date(),
                    closeReason: dumpAll ? 'dump-all' : 'sell-all',
                });
            } else {
                await position.update({
                    tokenRemaining: remainder.toFixed(),
                    soldFor: totalSoldFor.toFixed(),
                    approved: true,
                });
            }

            this.logger.log(`Sold ${sellPercentage}% of ${token} for ${fromWei(sold.toFixed())} BNB (total so far: ${fromWei(totalSoldFor.toFixed())} BNB)`);
        } catch (error) {
            await position.update({
                closedAt: new Date(),
                closeReason: 'error',
            });

            this.logger.log(`Error while selling ${position.pair}: ${error.message}`);
        }
    }
}