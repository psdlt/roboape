import {Position} from "./Entities";
import LoadConfig from "./Services/LoadConfig";

new LoadConfig();

(async () => {
    await Position.sync({alter: true});

    console.log('Done');
})();
