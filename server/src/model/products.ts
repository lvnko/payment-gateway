import { Knex } from "knex";
import { Base, IBase } from "./base";
import { isEmpty } from "lodash";

export interface Product {
    id: number;
    name: string;
    amount: number;
    description: string;
    preOrder: number;
    price: number;
}

export interface IProductModel extends IBase<Product> {
    preSell(product: Pick<Product, 'id' | 'amount' | 'price'>, trx?: Knex.Transaction): Promise<boolean>;
    findByIds(ids: number[], trx?: Knex.Transaction): Promise<Product[] | null>;
    updateAmount(product: Pick<Product, 'id' | 'amount' | 'price'>, trx?: Knex.Transaction): Promise<boolean>;
}

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

    public preSell = async (
        product: Pick<Product, 'id' | 'amount' | 'price'>,
        trx: Knex.Transaction
    ): Promise<boolean> => {
        let queryBuilder = this.knexSql(this.tableName)
            .where({ id: product.id })
            .where(this.schema.amount, ">=", product.amount)
            .whereRaw(`${this.schema.amount} - ${this.schema.preOrder} >= ?`, [product.amount])
            .update(
                this.schema.preOrder,
                this.knexSql.raw(`?? + ?`, [this.schema.preOrder, product.amount])
            );

        if (trx) queryBuilder = queryBuilder.transacting(trx);
        
        const result = await queryBuilder;

        return !!result;
    }

    public findByIds: IProductModel["findByIds"] = async (ids, trx) => {

        let queryBuilder = this.knexSql(this.tableName).whereIn('id', ids);

        if (trx) queryBuilder = queryBuilder.transacting(trx);
        
        const result = await queryBuilder;
        if (isEmpty(result)) return null;

        return result.map(this.DBData2DataObject) as Product[];
    }

    public updateAmount: IProductModel["updateAmount"] = async (product, trx) => {

        let queryBuilder = this.knexSql(this.tableName)
            .where('id', product.id)
            .where(this.schema.preOrder, ">", 0)
            .where(this.schema.amount, ">=", product.amount)
            .whereRaw(`${this.schema.amount} - ${this.schema.preOrder} >= ?`, [product.amount])
            .update(
                this.schema.amount,
                this.knexSql.raw(`?? - ?`, [this.schema.amount, product.amount])
            )
            .update(
                this.schema.preOrder,
                this.knexSql.raw(`?? - ?`, [this.schema.preOrder, product.amount])
            );

        if (trx) queryBuilder = queryBuilder.transacting(trx);
    
        const result = await queryBuilder;

        return !!result;
    }
}