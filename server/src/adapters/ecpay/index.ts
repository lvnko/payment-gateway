import ECPayPayment from "./ECPAY_Payment_node_js";

interface CVS_INFO {
    StoreExpireDate: string;
    Desc_1: string;
    Desc_2: string;
    Desc_3: string;
    Desc_4: string;
    PaymentInfoURL: string;
}

interface CVS_PARAMS {
    MerchantTradeNo: string; //請帶20碼uid, ex: f0a0d7e9fae1bb72bc93
    MerchantTradeDate: string; //ex: 2017/02/13 15:45:30
    TotalAmount: string;
    TradeDesc: string;
    ItemName: string;
    ReturnURL: string;
}

interface CreateBillParams {
    cvsInfo?: CVS_INFO;
    cvsParams: CVS_PARAMS;
    invParmas?: {};
    clientRedirectUrl?: string;
}

interface IECPayAdapterOptions {
    OperationMode: "Test" | "Production"
    MercProfile: {
        MerchantID: string;
        HashKey: string;
        HashIV: string;
    },
    IgnorePayment: string[
    //    "Credit",
    //    "WebATM",
    //    "ATM",
    //    "CVS",
    //    "BARCODE",
    //    "AndroidPay"
    ];
    IsProjectContractor: boolean;
}

const defaultOptions: IECPayAdapterOptions = {
    OperationMode: "Test", //Test or Production
    MercProfile: {
        MerchantID: "3002607",
        HashKey: "pwFHCqoQZGmho4w6",
        HashIV: "EkRm7iFT261dpevs"
    },
    IgnorePayment: [
    //    "Credit",
    //    "WebATM",
    //    "ATM",
    //    "CVS",
    //    "BARCODE",
    //    "AndroidPay"
    ],
    IsProjectContractor: false
};

export interface IECPayAdapter {
    createCVS(createBillParams: CreateBillParams): string;
}

export class ECPayAdapter implements IECPayAdapter {

    private ecpayInstance;

    constructor(options: IECPayAdapterOptions = defaultOptions) {
        this.ecpayInstance = new ECPayPayment(options);
    }

    createCVS = (createBillParams: CreateBillParams) => {
        const {
            cvsInfo = {
                StoreExpireDate: '',
                Desc_1: '',
                Desc_2: '',
                Desc_3: '',
                Desc_4: '',
                PaymentInfoURL: ''
            },
            cvsParams,
            invParmas = {},
            clientRedirectUrl = ""
        } = createBillParams;

        const html = this.ecpayInstance.payment_client.aio_check_out_cvs(
            cvsInfo,
            cvsParams,
            invParmas,
            clientRedirectUrl
        );
        console.log("🚀 ~ index.ts:97 ~ ECPayAdapter ~ html:", html)
        return html;
    }
}