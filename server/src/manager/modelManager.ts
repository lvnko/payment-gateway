import knex, { Knex } from "knex";
import { IProductModel, ProductModel } from "@/model/products";

export interface ModelContext {
    productModel: IProductModel;
}

export const modelManager = ({ knexSql }: { knexSql: Knex }): ModelContext => {
    const productModel = ProductModel.createModel({ knexSql });
    return { productModel };
}