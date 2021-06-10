import {DataTypes, Sequelize} from "sequelize";
import { PositionStatic } from "./Position";

export function PositionFactory(sequelize: Sequelize): PositionStatic
{
    return <PositionStatic>sequelize.define("Positions", {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        pair: {
            type: DataTypes.STRING,
            unique: true,
        },
        token0: {
            type: DataTypes.STRING,
        },
        token1: {
            type: DataTypes.STRING,
        },
        spent: {
            type: DataTypes.DECIMAL(128,0),
            allowNull: true,
        },
        gotToken: {
            type: DataTypes.DECIMAL(128,0),
            allowNull: true,
        },
        tokenRemaining: {
            type: DataTypes.DECIMAL(128,0),
            allowNull: true,
        },
        soldFor: {
            type: DataTypes.DECIMAL(128,0),
            allowNull: true,
        },
        openedAt: {
            allowNull: true,
            type: DataTypes.DATE
        },
        closedAt: {
            allowNull: true,
            type: DataTypes.DATE
        },
        closeReason: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        reserveEnter: {
            type: DataTypes.DECIMAL(128,0),
            allowNull: true,
        },
        profitLoss: {
            type: DataTypes.DECIMAL(128,0),
            allowNull: true,
        },
        profitLossCheckedAt: {
            allowNull: true,
            type: DataTypes.DATE
        },
        approved: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        }
    });
}