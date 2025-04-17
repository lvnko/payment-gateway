import { Knex } from "knex";
import { Base, IBase } from "./base";

export interface Product {
    id: number;
    name: string;
    amount: number;
    description: string;
    pre_order: number;
    price: number;
}

export interface IProductModel extends IBase<Product> {}

export class ProductModel extends Base<Product> implements IProductModel {

    tableName = 'products';

    // schema, key -> attr name of dataObject, value -> name of db table columns.
    schema = {
        id: "id",
        name: "name",
        amount: "amount",
        description: "description",
        preOrder: "pre_order",
        price: "price"
    };

    constructor({ knexSql, tableName }: { knexSql: Knex; tableName?: string }) {
        super({ knexSql, tableName });
    }

    static createModel = ({ knexSql, tableName }: { knexSql: Knex; tableName?: string }) => {
        return new ProductModel({ knexSql });
    }
}