import { IOrderModel, OrderContent, OrderStatus, PaymentProvider, PaymentWay } from "@/model/order";
import { IProductModel } from "@/model/products";
import { NextFunction, Request, Response } from "express";
import { Knex } from "knex";
import { isEmpty, pick } from "lodash";
import { body, ValidationChain, validationResult } from "express-validator";
import { genUID, transactionHandler } from "@/utils";
import { stat } from "fs";
import { paymentDispatcher } from "@/dispatcher";

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
    updateOrder(
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
                
                const results = await Promise.all(
                    content.map(async product => await this.productModel.preSell({
                        id: product.productId,
                        ...pick(product, ['amount', 'price'])
                    }, trx))
                );

                if (results.some(result => !result))
                    throw new Error("Product not found or insufficient stock.");

                const totalPrice = content.reduce((accm, product)=> accm + (product.price * product.amount), 0);
                const uid = genUID();

                await this.orderModel.create({
                    id: uid,
                    total: totalPrice,
                    createdAt: new Date(),
                    updatedAt:  new Date(),
                    paymentProvider,
                    paymentWay,
                    status: OrderStatus.WAITING,
                    content
                }, trx);

                const products = await this.productModel.findByIds(content.map(item => item.productId)) || [];
                const payloadDetails = content.map(({ productId, price, amount }) => ({
                    name: products.find(p => p.id === productId)?.name || "",
                    price: price,
                    amount: amount
                }));

                // 第 4 步：金流 API 的串接 (ECPAY / Paypal)
                const result = await paymentDispatcher({
                    paymentProvider,
                    paymentWay,
                    payload: {
                        billId: uid,
                        totalPrice,
                        desc: `Create order of #bill: ${uid} with ${content.map(item => item.productId).join(",")}`,
                        details: payloadDetails,
                        returnURL: `${process.env.END_POINT}/order/update`
                    }
                });

                res.json({ status: "success", data: result });
            });
        } catch (error) {
            console.error("Transaction error: ", error);
            res.status(500).json({ error });
            throw error;
        }
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
    }

    public updateOrder: IOrderController['updateOrder'] = async (req, res, _next) => {
        console.log("🚀 ~ orderController.ts:163 ~ OrderController ~ updateAmount:IOrderController['updateAmount']= ~ req.body:", req.body);
        
        const failedResponse = () => {
            return res.status(500).json("0|FAILED");
        }

        let merchantTradeNo = '';
        let tradeDate = '';

        if ("RtnCode" in req.body && "MerchantTradeNo" in req.body) {
            
            const { MerchantTradeNo, RtnCode, TradeDate } = req.body;
            
            if (RtnCode !== '1')
                return failedResponse();
            
            merchantTradeNo = MerchantTradeNo;
            tradeDate = TradeDate;
        }

        try {
            
            // #1 : 從 orders 中找出訂單
            const order = await this.orderModel.findOne(merchantTradeNo);
            if (
                isEmpty(order) ||
                order?.status !== OrderStatus.WAITING
            ) return failedResponse();

            // #2 : 更新相關 products 的庫存量
            const results = await Promise.all(
                order!.content.map(async (product) => await this.productModel.updateAmount({
                    id: product.productId,
                    ...pick(product, ['amount', 'price'])
                }))
            );
            if (results.some(result => !result)) return failedResponse();

            // #3 : 更新 order 狀態
            await this.orderModel.update(
                merchantTradeNo,
                {
                    status: OrderStatus.SUCCESS,
                    updatedAt: new Date(tradeDate)
                }
            );

            res.status(200).send("1|OK");

        } catch (error) {
            console.log("🚀 ~ orderController.ts:182 ~ OrderController ~ updateOrder:IOrderController['updateOrder']= ~ error:", error);
            return failedResponse();
        }
    }
}