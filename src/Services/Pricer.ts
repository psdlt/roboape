import BigNumber from "bignumber.js";
import Reserve from "../Models/Reserve";

export default class Pricer {
    public static getOutGivenIn(
        currentReserve: Reserve,
        token0In: BigNumber = null,
        token1In: BigNumber = null,
        feeMultiplier: number = 9975,
    ): BigNumber {
        if (token0In.gt(0)) {
            const amountInWithFee = token0In.multipliedBy(feeMultiplier);
            const numerator = amountInWithFee.multipliedBy(currentReserve.reserve1);
            const denominator = currentReserve.reserve0.multipliedBy(10000).plus(amountInWithFee);
            return numerator.dividedBy(denominator).integerValue();
        } else if (token1In.gt(0)) {
            const amountInWithFee = token1In.multipliedBy(feeMultiplier);
            const numerator = amountInWithFee.multipliedBy(currentReserve.reserve0);
            const denominator = currentReserve.reserve1.multipliedBy(10000).plus(amountInWithFee);
            return numerator.dividedBy(denominator).integerValue();
        } else {
            throw new Error('One of them has to be non-zero');
        }
    }

    public static calcNewReserveExactIn(
        currentReserve: Reserve,
        token0In: BigNumber = null,
        token1In: BigNumber = null,
    ): Reserve {
        if (token0In.gt(0)) {
            const outWithFee = Pricer.getOutGivenIn(currentReserve, token0In, token1In);

            return new Reserve(
                currentReserve.reserve0.plus(token0In).toFixed(),
                currentReserve.reserve1.minus(outWithFee).toFixed(),
            );
        } else if (token1In.gt(0)) {
            const outWithFee = Pricer.getOutGivenIn(currentReserve, token0In, token1In);

            return new Reserve(
                currentReserve.reserve0.minus(outWithFee).toFixed(),
                currentReserve.reserve1.plus(token1In).toFixed(),
            );
        } else {
            throw new Error('One of them has to be non-zero');
        }
    }
}