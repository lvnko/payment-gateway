import { isJson } from "@/utils";
import { Knex } from "knex";
import { camelCase, isEmpty, isObject, mapKeys, mapValues, snakeCase } from "lodash";

// T 在這個階段，先不給他真正的型別：而是等到其他繼承他的Class要用的時候再傳入型別
// database transaction，資料庫交易： => 保證多筆的 database 操作，能夠一起完成 或 是一起失敗
// 例如：
// 今天因應用戶的一個動作，以致系統去執行以下步驟：
//  1. select 找一筆訂單
//  2. udpate 將錢轉出
//  3. create 創建 Log
//  4. select 找出更新後的訂單
//  5. ...
// 試想一下，如果在第 2 步驟的時候，發生了錯誤，那麼第 3 及之後的步驟都不應該被執行
// 這時候就需要用到 transaction，而它的概念就是：
//  A. 要去保證任何交給它的連串動作都是 一起完成 或 一起失敗
//  B. 任何時候，只要在 transaction 的其中一個步驟失敗了，那麼所有的步驟都會被取消 (rollback)
//  C. 這樣便可保證資料庫維持在提出 transaction 請求之前的狀態

export interface IBase<T> {
    findAll(trx?: Knex.Transaction): Promise<T[] | null>;
    findOne(id: any, trx?: Knex.Transaction): Promise<T | null>;
    create(data: Omit<T, 'id'>, trx?: Knex.Transaction): Promise<T | null>;
    update(id: any, data: Partial<Omit<T, 'id'>>, trx?: Knex.Transaction): Promise<T | null>;
    delete(id: any, trx?: Knex.Transaction): Promise<void>;
}

export abstract class Base<T> implements IBase<T> {

    protected knexSql: Knex;
    protected tableName: string = '';
    protected schema = {};

    constructor({ knexSql, tableName }: {
        knexSql: Knex,
        tableName?: string
    }) {

        this.knexSql = knexSql;

        if (tableName) {
            this.tableName = tableName;
        }

    }

    public findAll = async (trx?: Knex.Transaction) => {
        // select col1, col2, col3... from tableName
        let sqlBuilder = this.knexSql(this.tableName).select(this.schema);

        if (trx) sqlBuilder = sqlBuilder.transacting(trx);
        const result = await sqlBuilder;
        
        return isEmpty(result) ? null : this.DBData2DataObject(result) as T[];
    }

    public findOne = async (id: any, trx?: Knex.Transaction) => {
        let sqlBuilder = this.knexSql(this.tableName).select(this.schema).where({ id });

        if (trx) sqlBuilder = sqlBuilder.transacting(trx);
        const result = await sqlBuilder;
        
        return isEmpty(result) ? null : this.DBData2DataObject(result[0]) as T;
    }

    public create = async (data: Omit<T, 'id'>, trx?: Knex.Transaction) => {
        let sqlBuilder = this.knexSql(this.tableName).insert(this.DataObject2DBData(data));

        if (trx) sqlBuilder = sqlBuilder.transacting(trx);
        const result = await sqlBuilder;

        if (isEmpty(result)) return null;
        const id = result[0];

        return this.findOne(id, trx);
    }

    public update = async (id: any, data: Partial<Omit<T, 'id'>>, trx?: Knex.Transaction) => {
        let sqlBuilder = this.knexSql(this.tableName).update(this.DataObject2DBData(data)).where({ id });

        if (trx) sqlBuilder = sqlBuilder.transacting(trx);
        await sqlBuilder;

        return this.findOne(id, trx);
    }

    public delete = async (id: any, trx?: Knex.Transaction) => {
        let sqlBuilder = this.knexSql(this.tableName).where({ id }).del();

        if (trx) sqlBuilder = sqlBuilder.transacting(trx);
        await sqlBuilder;

        return;
    }

    private DBData2DataObject = (data: any) => {
        
        const transform = mapValues(data, (value, key) => {
            
            if (['created_at', 'updated_at'].includes(key)) return new Date(value);
            // check if a string is potentially a json
            if (isJson(value)) return JSON.parse(value);

            return value;

        });

        return mapKeys(transform, (_value, key) => camelCase(key));
    }

    private DataObject2DBData = (data: any) => {

        const transform = mapValues(data, (value, key) => {

            // if (value instanceof Date) return value.toISOString();
            // if (typeof value === 'object') return JSON.stringify(value);
            if (['createdAt', 'updatedAt'].includes(key)) return new Date(value);
            // check if value is an object
            if (isObject(value)) return JSON.stringify(value);
            
            return value;
        });

        return mapKeys(transform, (_value, key) => snakeCase(key));

    }

}