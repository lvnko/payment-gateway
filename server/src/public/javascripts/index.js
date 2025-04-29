const serverDomain = "http://localhost:30000";

var vue = new Vue({
    el: '#app',
    data() {
        return {
            paymentPlatform: "",
            buyItems: {}, // : Record<string, number> (e.g. { "id": "amount", ... })
            products: []
        }
    },
    async mounted() {
        this.products = await fetch(`${serverDomain}/product/list`).then(res => res.json());
        console.log('file : javascripts/index.js : this.products => ', this.products);
        console.log('Object.keys(this.products) => ', Object.keys(this.products));
        
        paypal.Buttons({
            createOrder: async (data, actions) => {
                // 串接 Express.js server 的 handler.
                const items = this.getItemDetailByBuyItems();
                const result = await this.sendPayment(`${serverDomain}/order/create`, {
                    paymentProvider: "PAYPAL",
                    paymentWay: "PAYPAL",
                    content: items
                });
                console.log("🚀 ~ index.js:26 ~ createOrder: ~ result:", result);
                // '06K661981V283114C' // 來自教程範例 id
                // "98S96604KF200093K" // 親自試驗所得 id
                return result.data;
            },
            onApprove: (data, actions) => {
                console.log("🚀 ~ index.js:22 ~ mounted ~ data:", data)
                return actions.order.capture();
            }
        }).render('#paypal-button-container');
    },
    methods: {
        getItemDetailByBuyItems() {
            return Object.entries(this.buyItems).map(([id, amount]) => ({
                productId: Number(id),
                price: this.products.find(product => product.id === Number(id)).price,
                amount: Number(amount)
            }));
        },
        async sendPayment(url, data) {
            try {
                const result = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    cors: 'no-cors',
                    body: JSON.stringify(data)
                }).then(res => {
                    if (res.ok) return res.json();
                    return res.json().then((json)=> Promise.reject(json));
                });
                return result;
            } catch (error) {
                console.log("🚀 ~ index.js:38 ~ sendPayment ~ error:", error);
                throw new Error(error);
            }
        },
        async ECPay() {
            if (!Object.keys(this.buyItems).length) return alert("沒有購買項目。");
            const items = this.getItemDetailByBuyItems();
            console.log("🚀 ~ index.js:45 ~ ECPay ~ items:", items);
            const result = await this.sendPayment(`${serverDomain}/order/create`, {
                paymentProvider: "ECPAY",
                paymentWay: "CVS",
                content: items
            });
            console.log("🚀 ~ index.js:51 ~ ECPay ~ result:", result);
            const { data: html } = result;
            this.paymentPlatform = html;
            console.log("🚀 ~ index.js:56 ~ ECPay ~ this.paymentPlatform:", this.paymentPlatform);
            this.$nextTick(() => {
                document.getElementById("_form_aiochk").submit();
            });
        }
    }
});