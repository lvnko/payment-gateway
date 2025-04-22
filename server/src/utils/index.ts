import { Knex, knex } from "knex";
import { v4 as uuid } from 'uuid';

enum ISOLATION_LEVEL {
    READ_UNCOMMITTED = 'READ UNCOMMITTED',
    READ_COMMITTED = 'READ COMMITTED',
    REPEATABLE_READ = 'REPEATABLE READ',
    SERIALIZABLE = 'SERIALIZABLE'
}

export const createDatabase = () => {
    return knex({
        client: 'mysql',
        connection: {
            host: process.env.DATABASE_HOST || '127.0.0.1',
            port: Number(process.env.DATABASE_PORT) || 3306,
            user: process.env.DATABASE_USER || 'root',
            password: process.env.DATABASE_PASSWORD || 'xuemi_example',
            database: process.env.DATABASE_DATABASE || 'xue-mi',
        },
        pool: {
            min: 2,
            max: 10
        }
    })
}

export const isJson = (value: string) => {
    try {
        return Boolean(JSON.parse(value));
    } catch (e) {
        return false;
    }
}

function sleep(maxBackOff: number): Promise<number> {
    return new Promise((resolve) => setTimeout(() => resolve(1), maxBackOff));
}

export const transactionHandler = async <T = any>(
    knex: Knex,
    callback: (trx: Knex.Transaction) => Promise<T>,
    options: {
        retryTimes?: number;
        maxBackOff?: number;
        isolation? : ISOLATION_LEVEL;
    } = {}
) => {
    const { retryTimes = 100, maxBackOff = 1000, isolation } = options;
    let attempts = 0;

    const execTransaction = async (): Promise<T> => {
        const trx = await knex.transaction();

        try {
            if (isolation) {
                await trx.raw(`SET TRANSACTION ISOLATION LEVEL ${isolation}`);
            }

            const result = await callback(trx);
            await trx.commit();
            return result;

        } catch (error: any) {
            await trx.rollback();
            if (error.code !== '1205') throw error;
            if (attempts >= retryTimes) throw Error('Transaction failed after maximum retries');
            attempts++;

            await sleep(maxBackOff);
            return execTransaction();
        }
    }

    return await execTransaction();
}

export const genUID = () => {
    // UID format => timestamp : int(13) + string : varchar(7)
    const alphabetMask = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const timestampStr = new Date().getTime().toString();
    const code = timestampStr.split("")
        .map((value, index)=> index % 2 ? value : alphabetMask[Number(index)])
        .join("");
    
    const [uuidPartial] = uuid().split("-");
    return `${code}${uuidPartial.substring(0, 7)}`;
}