import { ECPayAdapter } from "@/adapters/ecpay";
import { PaymentProvider, PaymentWay } from "@/model/order";
import dayjs from "dayjs";

export interface IOrderDetail {
    name: string;
    price: number;
    amount: number;
}

export interface IPaymentPayload {
    billId: string;
    totalPrice: number;
    desc: string;
    details: IOrderDetail[];
    returnURL: string;
}

export const paymentDispatcher = async ({
    paymentProvider,
    paymentWay,
    payload
}: {
    paymentProvider: PaymentProvider,
    paymentWay: PaymentWay,
    payload: IPaymentPayload
}) => {
    const ecpay = new ECPayAdapter();

    if (paymentProvider === PaymentProvider.ECPAY) {
        if (paymentWay === PaymentWay.CVS) {
            const html = await ecpay.createCVS({
                cvsParams: {
                    MerchantTradeNo: payload.billId,
                    MerchantTradeDate: dayjs(new Date()).format("YYYY/MM/DD HH:mm:ss"), //ex: 2017/02/13 15:45:30
                    TotalAmount: String(payload.totalPrice),
                    TradeDesc: payload.desc,
                    ItemName: payload.details.map(({name, price, amount}) => `${name}($${price}) x ${amount}`).join("#"),
                    ReturnURL: payload.returnURL,
                }
            });
            return html;
        } else throw new Error("Unsupported payment way.");
    } else if (paymentProvider === PaymentProvider.PAYPAL) {
        // TODO: Implement PayPal payment
    } else throw new Error("Unsupported payment provider.");
}