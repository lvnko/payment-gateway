const serverDomain = "http://localhost:30000";

var vue = new Vue({
    el: '#app',
    data() {
        return {
            products: []
        }
    },
    async mounted() {
        this.products = await fetch(`${serverDomain}/product/list`).then(res => res.json());
        console.log('file : javascripts/index.js : this.products => ', this.products);
    }
});