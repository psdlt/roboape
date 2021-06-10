import Logger from "./Logger";
import {Position} from "../Entities";
import {Op} from "sequelize";
import Web3Helper from "./Web3Helper";
import Pricer from "./Pricer";
import {Symbols} from "../Models/Symbols";
import BigNumber from "bignumber.js";
import {fromWei} from "web3-utils";
import {PositionAttributes} from "../Entities/Position";
import AutoSell from "./AutoSell";

export default class ProfitLossManager {
    private logger: Logger = new Logger('ProfitLossManager');
    private autoSell: AutoSell = null;

    constructor(
        private web3Helper: Web3Helper,
    ) {
        this.autoSell = new AutoSell(this.web3Helper);

        setInterval(() => {
            this.check();
        }, 60 * 1000);
    }

    private check() {
        const date = new Date();
        date.setMinutes(date.getMinutes() - 30);

        let bestProfit: BigNumber = null;

        Position.findAll({
            where: {
                openedAt: { [Op.ne]: null },
                closedAt: { [Op.eq]: null },
                profitLossCheckedAt: { [Op.lte]: date },
            }
        }).then((positions) => {
            const toCheck = positions.length;
            let checked = 0;

            this.logger.log(`Have ${toCheck} positions to check`);

            positions.forEach(async (position) => {
                const tokensRemaining = await this.web3Helper.balanceOf(position.token0 === Symbols.wbnb ? position.token1 : position.token0);
                if (tokensRemaining.eq(0)) {
                    this.logger.error(`0 tokens remaining for ${position.pair}`);
                    return;
                }

                const reserve = await this.web3Helper.getReserve(position.pair);

                const bnbReserve = position.token0 === Symbols.wbnb ? reserve.reserve0 : reserve.reserve1;
                const bnbReserveRemaining = bnbReserve.multipliedBy(100).dividedBy(position.reserveEnter);

                const bnbOut = Pricer.getOutGivenIn(
                    reserve,
                    position.token0 === Symbols.wbnb ? new BigNumber(0) : tokensRemaining,
                    position.token0 === Symbols.wbnb ? tokensRemaining : new BigNumber(0),
                );

                const profitLoss = bnbOut.minus(position.spent);

                const updateFields: PositionAttributes = {
                    pair: position.pair,
                    token0: position.token0,
                    token1: position.token1,

                    profitLoss: profitLoss.toFixed(),
                    profitLossCheckedAt: new Date(),
                    tokenRemaining: tokensRemaining.toFixed(),
                };

                if (bnbReserveRemaining.lte(0.5) && profitLoss.lte(0)) {
                    // less than 0.5% of initial BNB reserve remaining - calling it a rug pull
                    updateFields.closedAt = new Date();
                    updateFields.closeReason = 'rug';

                    this.logger.log(`Marking ${position.pair} as a rug (remainder of original BNB reserve: ${bnbReserveRemaining.toFixed(2)}%)`)
                }

                await position.update(updateFields);

                if (bnbReserveRemaining.gt(0.5)) {
                    this.autoSell.sellIfProfitable(position);
                }

                if (bestProfit === null || profitLoss.gt(bestProfit)) {
                    bestProfit = profitLoss;
                }

                checked++;
                if (checked === toCheck && bestProfit !== null) {
                    this.logger.log(`Best profit of all those: ${fromWei(bestProfit.toFixed())}`);
                }
            });
        });
    }
}
