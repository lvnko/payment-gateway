import { IPaymentPayload } from "@/dispatcher";

import {
    ApiError,
    CheckoutPaymentIntent,
    Client,
    Environment,
    LogLevel,
    OrdersController,
    PaymentsController,
    PaypalExperienceLandingPage,
    PaypalExperienceUserAction,
    ShippingPreference,
} from "@paypal/paypal-server-sdk";

const {
    NODE_ENV,
    PAYPAL_CLIENT_ID = 'PAYPAL_CLIENT_ID',
    PAYPAL_CLIENT_SECRET = 'PAYPAL_CLIENT_SECRET'
} = process.env;

export interface IPaypalAdapter {
    createOrder(props: Omit<IPaymentPayload, "desc" | "returnURL">): Promise<string>;
}

export class PaypalAdapter implements IPaypalAdapter {
    
    private paypayClient: any;
    
    constructor() {
        this.paypayClient = new Client({
            clientCredentialsAuthCredentials: {
                oAuthClientId: PAYPAL_CLIENT_ID,
                oAuthClientSecret: PAYPAL_CLIENT_SECRET,
            },
            timeout: 0,
            environment: NODE_ENV === "production" ? Environment.Production : Environment.Sandbox,
            logging: {
                logLevel: LogLevel.Info,
                logRequest: { logBody: true },
                logResponse: { logHeaders: true },
            }
        });
    }

    public createOrder:IPaypalAdapter["createOrder"] = async ({
        billId, totalPrice, details
    }) => {
        const ordersController = new OrdersController(this.paypayClient);
        // {
        //     body: OrderRequest;
        //     paypalMockResponse?: string | undefined;
        //     paypalRequestId?: string | undefined;
        //     paypalPartnerAttributionId?: string | undefined; paypalClientMetadataId?: string | undefined;
        //     prefer?: string | undefined;
        //     paypalAuthAssertion?: string | undefined;
        // }
        const collect = {
            body: {
                intent: CheckoutPaymentIntent.Capture,
                purchaseUnits: [
                    {
                        customId: billId,
                        amount: {
                            currencyCode: "USD",
                            value: totalPrice.toString(),
                            breakdown: {
                                itemTotal: {
                                    currencyCode: "USD",
                                    value: totalPrice.toString(),
                                },
                            },
                        },
                        // lookup item details in `cart` from database
                        items: details.map((item)=>({
                            name: item.name,
                            description: item.desc,
                            unitAmount: {
                                currencyCode: "USD",
                                value: item.price.toString()
                            },
                            quantity: item.amount.toString()
                        }))
                    },
                ],
            },
            prefer: "return=representation",
        };
        
        try {
            const { body, ...httpResponse } = await ordersController.createOrder(
                collect
            );
            console.log("🚀 ~ index.ts:94 ~ PaypalAdapter ~ body:", body)
            // Get more response info...
            // const { statusCode, headers } = httpResponse;
            // return {
            //     jsonResponse: JSON.parse(String(body)),
            //     httpStatusCode: httpResponse.statusCode,
            // };
            const { id } = JSON.parse(String(body));
            return id;
        } catch (error: any) {
            console.log("🚀 ~ index.ts:104 ~ PaypalAdapter ~ error:", error);
            throw new Error(error instanceof ApiError ? error.message : error);
        }
    }
}