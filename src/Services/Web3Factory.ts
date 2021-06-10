import Web3 from "web3";

export default class Web3Factory {
    public static make() {
        return new Web3(new Web3.providers.WebsocketProvider(process.env.WEB3_WS_PROVIDER));
    }
}
