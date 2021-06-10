import LoadConfig from "./Services/LoadConfig";
import DumpAll from "./Services/DumpAll";
import Web3Factory from "./Services/Web3Factory";
import Web3Helper from "./Services/Web3Helper";
import * as minimist from "minimist";

// parse args
const args = minimist(process.argv, {
    string: ['single'],
});

new LoadConfig();

(async () => {
    const web3 = Web3Factory.make();
    const web3Helper = new Web3Helper(web3);
    await web3Helper.init();

    const dumper = new DumpAll(web3Helper);
    if (args.single) {
        dumper.dumpSingle(args.single);
        return;
    }

    dumper.dumpAll();
})();