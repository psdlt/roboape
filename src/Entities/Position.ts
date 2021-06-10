import { BuildOptions, Model } from "sequelize";
export interface PositionAttributes {
    id?: number;
    pair: string;
    token0: string;
    token1: string;
    spent?: string;
    gotToken?: string;
    tokenRemaining?: string;
    soldFor?: string;
    openedAt?: Date;
    closedAt?: Date;
    closeReason?: string;
    reserveEnter?: string;
    profitLoss?: string;
    profitLossCheckedAt?: Date;
    approved?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface PositionModel extends Model<PositionAttributes>, PositionAttributes {}
export class Position extends Model<PositionModel, PositionAttributes> {}
export type PositionStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): PositionModel;
};