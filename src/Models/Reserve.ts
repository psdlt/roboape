import BigNumber from "bignumber.js";

export default class Reserve
{
    public reserve0: BigNumber;
    public reserve1: BigNumber;

    constructor(r0: string, r1: string) {
        this.reserve0 = new BigNumber(r0);
        this.reserve1 = new BigNumber(r1);
    }
}