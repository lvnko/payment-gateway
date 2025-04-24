const serverDomain = "http://localhost:30000";

var vue = new Vue({
    el: '#app',
    data() {
        return {
            buyItems: {}, // : Record<string, number> (e.g. { "id": "amount", ... })
            products: []
        }
    },
    async mounted() {
        this.products = await fetch(`${serverDomain}/product/list`).then(res => res.json());
        console.log('file : javascripts/index.js : this.products => ', this.products);
        console.log('Object.keys(this.products) => ', Object.keys(this.products));
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
            console.log("🚀 ~ index.js:51 ~ ECPay ~ result:", result)
        }
    }
});