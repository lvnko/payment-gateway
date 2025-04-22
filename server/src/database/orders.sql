CREATE TABLE `orders` (
    `id` varchar(20) NOT NULL PRIMARY KEY COMMENT "大部分金流的 API 都要求你的 ID 是一個亂数的字串",
    `total` integer NOT NULL DEFAULT 0 COMMENT "訂單總價 UNSIGNED",
    `created_at` datetime NOT NULL DEFAULT now() COMMENT "訂單產生日期時間",
    `updated_at` datetime NOT NULL DEFAULT now() COMMENT "訂單更新日期時間",
    `payment_provider` enum("PAYPAL", "ECPAY") COMMENT "訂單交易的金流是由哪一間 Payment Gateway 廠商的 API 所促成的",
    `payment_way` enum("CVS", "CC", "ATM", "PAYPAL") COMMENT "用戶進行支付的方法",
    `status` enum("WAITING", "SUCCESS", "FAILED", "CANCEL") COMMENT "訂單的狀態",
    `content` json DEFAULT NULL COMMENT "訂單內的商品內容，e.g.: [{商品ID, 商品數量, 商品價格}] (有別於一般 M2M 或 O2M 的數據庫設計，這裡使用 JSON 的方式儲存商品的相關資料)"
);