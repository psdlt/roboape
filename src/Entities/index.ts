import * as sequelize from 'sequelize';
import {PositionFactory} from "./PositionFactory";
import LoadConfig from "../Services/LoadConfig";

new LoadConfig();

export const dbConfig = new sequelize.Sequelize(
    (process.env.DB_NAME),
    (process.env.DB_USER),
    (process.env.DB_PASSWORD),
    {
        port: Number(process.env.DB_PORT) || 5432,
        host: process.env.DB_HOST,
        dialect: "postgres",
        dialectModule: require('pg'),
        pool: {
            min: 0,
            max: 5,
            acquire: 30000,
            idle: 10000,
        },
        logging: false,
    }
);

export const Position = PositionFactory(dbConfig);
