import { knex } from "knex"

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