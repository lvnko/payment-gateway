# Week #013 ~ #016
## 專案啟動步驟
1. 啟動數據庫
```shell
payment-gateway $ cd mysql
mysql $ docker-compose up -d
```
2. 啟動後台伺服器
```shell
payment-gateway $ cd server
server $ npm run start
```

## 架構設計
| 架構中所屬層次 | 技術工具/框架 | 角色 |
|---|---|---|
| Client | 未知 | Frontend renderer (前台網頁渲染) |
| Backend | Node.js (Gen Express.js by Typescript) | Web service (專案核心部分) |
| Database | MySQL on Linux (Contained by Docker, name: xue-mi) | 數據庫 |

## Database 規劃
### 1. 產品表
| 欄稱 | 型別 | 功用 | 邏輯規範 |
|---|---|---|---|
| id | integer | 以流水號形式，作為唯一代替產品名稱的辨識號 | UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY |
| name | varchar(255) | 產品名稱 | NOT NULL DEFAULT '' |
| amount | integer | 產品的數量 | UNSIGNED NOT NULL DEFAULT 0 |
| description | text | 產品的描述 | |
| pre_order | integer | 作為金流交易賣出物品時的預購額度 | UNSIGNED NOT NULL DEFAULT 0 |
### 2. 訂單表
| 欄稱 | 型別 | 功用 | 邏輯規範 |
|---|---|---|---|
| id | varchar(20) | 大部分金流的 API 都要求你的 ID 是一個亂数的字串 | NOT NULL PRIMARY KEY |
| total | integer | 訂單總價 | UNSIGNED NOT NULL DEFAULT 0 |
| created_at | datetime | 訂單產生日期時間 | NOT NULL DEFAULT now() |
| updated_at | datetime | 訂單更新日期時間 | NOT NULL DEFAULT now() |
| payment_provider | enum | 訂單交易的金流是由哪一間 Payment Gateway 廠商的 API 所促成的 | ENUM("PAYPAL", "ECPAY") |
| payment_way | enum | 用戶進行支付的方法 | ENUM("CSV", "CC", "ATM", "PAYPAL") |
| status | enum | 訂單的狀態 | ENUM("WAITING", "SUCCESS", "FAILED", "CANCEL") |
| content | json | 訂單內的商品內容，e.g.: [{商品ID, 商品數量, 商品價格}] (有別於一般 M2M 或 O2M 的數據庫設計，這裡使用 JSON 的方式儲存商品的相關資料) | DEFAULT NULL |

## 有用資源
- TablePlus : 可以連接不同種類資料庫的工具
