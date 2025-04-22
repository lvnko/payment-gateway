import { IOrderModel, OrderContent, PaymentProvider, PaymentWay } from "@/model/order";
import { IProductModel } from "@/model/products";
import { NextFunction, Request, Response } from "express";
import { Knex } from "knex";
import { isEmpty } from "lodash";
import { body, ValidationChain, validationResult } from "express-validator";
import { transactionHandler } from "@/utils";

interface OrderControllerProps {
    knexSql: Knex;
    orderModel: IOrderModel;
    productModel: IProductModel;
}

interface CreateOrderParams {
    paymentProvider: PaymentProvider;
    paymentWay: PaymentWay;
    content: OrderContent[];
}

export interface IOrderController {
    createOrder(
        req: Request<any, any, CreateOrderParams, any>,
        res: Response,
        _next: NextFunction
    ): void;
    createOrderValidator(): ValidationChain[];
    updateAmount(
        req: Request<any, any, any, any>,
        res: Response,
        _next: NextFunction
    ): void;
}

export class OrderController implements IOrderController {
    
    private knexSql: Knex;
    private orderModel: IOrderModel;
    private productModel: IProductModel;

    public static createController(props: OrderControllerProps) {
        return new OrderController(props);
    }

    constructor({ knexSql, orderModel, productModel }: OrderControllerProps) {
        this.knexSql = knexSql;
        this.orderModel = orderModel;
        this.productModel = productModel;
    }

    public createOrderValidator = () => {

        const paymentProviderValidator = (value:  any) => {
            return [PaymentProvider.ECPAY, PaymentProvider.PAYPAL].includes(value);
        }

        const paymentWayValidator = (value:  any) => {
            return [PaymentWay.CVS, PaymentWay.PAYPAL].includes(value);
        }

        const contentValidator = (value: OrderContent[]) => {
            if (isEmpty(value) || !Array.isArray(value)) return false;
            for (const product of value) {
                if ([product.productId, product.amount].some((val) => !val)) return false;
            }
            return true;
        }
        
        return [
            // 設定並執行不同內容的驗證，並報告這些內容是否合法。
            body("paymentProvider", "Invalid payment provider.").custom(paymentProviderValidator),
            body("paymentWay", "Invalid payment way.").custom(paymentWayValidator),
            body("content", "Invalid order content.").isArray().custom(contentValidator),
        ];
    }

    public createOrder: IOrderController['createOrder'] = async (req, res, _next) => {
        // 第 1 步：提取前端需要傳入的參數：
        //  a. 商品 ID 與 數量
        //  b. 用戶選擇使用的 Payment Provider 與 Payment Way
        const { paymentProvider, paymentWay, content } = req.body;

        // 第 2 步：驗證來自前端的參數
        //  這個步驟會先利用 express-validator 的 body 作為一個 middleware 去收集驗證結果
        //  然後在這裡從 req 讀取驗證結果
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }

        // 第 3 步：將這些資料寫入 database，並取得這筆 order 資料的 ID
        // transactionHandler
        try {
            await transactionHandler(this.knexSql, async (trx: Knex.Transaction) => {
                
            });
        } catch (error) {
            console.error("Transaction error: ", error);
            res.status(500).json({ error });
            throw error;
        }

        // 第 4 步：金流 API 的串接 (ECPAY / Paypal)
        // 第 5 步：回覆 database createOrder 的執行結果給前端

        // const { total, paymentProvider, paymentWay, status, content } = req.body;
        // const result = await this.orderModel.create({
        //     total,
        //     paymentProvider,
        //     paymentWay,
        //     status,
        //     content
        // });
        // res.json(result);

        res.json({ status: "success" });
    }

    public updateAmount: IOrderController['updateAmount'] = async (_req, _res, _next) => {
        // TODO: ...
    }
}