import { Knex } from "knex";
import { Base, IBase } from "./base";

export enum PaymentProvider {
    ECPAY = "ECPAY",
    PAYPAL = "PAYPAL"
}

export enum PaymentWay {
    CVS = "CVS",
    CC = "CC",
    ATM = "ATM",
    PAYPAL = "PAYPAL"
}

export enum OrderStatus {
    WAITING = "WAITING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    CANCEL = "CANCEL"
}

export interface OrderContent {
    productId: number;
    amount: number;
    price: number;
}

export interface Order {
    id: string;
    total: number;
    createdAt: Date;
    updatedAt: Date;
    paymentProvider: PaymentProvider;
    paymentWay: PaymentWay;
    status: OrderStatus;
    content: OrderContent[];
}

export interface IOrderModel extends IBase<Order> {}

export class OrderModel extends Base<Order> implements IOrderModel {

    tableName = 'orders';

    // schema, key -> attr name of dataObject, value -> name of db table columns.
    schema = {
        id: "id",
        total: "total",
        createdAt: "created_at",
        updatedAt: "updated_at",
        paymentProvider: "payment_provider",
        paymentWay: "payment_way",
        status: "status",
        content: "content"
    };

    constructor({ knexSql, tableName }: { knexSql: Knex; tableName?: string }) {
        super({ knexSql, tableName });
    }

    static createModel = ({ knexSql, tableName }: { knexSql: Knex; tableName?: string }) => {
        return new OrderModel({ knexSql });
    }
}