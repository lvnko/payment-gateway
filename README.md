# Week #022 ~ #024
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

3. 啟動 ngrok 代為公開本地 API 端點
```shell
$ ngrok http --url={{path_to_expose}} 30000
```



## 架構設計
| 架構中所屬層次 | 技術工具/框架 | 角色 | MVC |
|---|---|---|---|
| Client | 未知 | Frontend renderer (前台網頁渲染) | View |
| Backend | Node.js (Gen Express.js by Typescript) | Web service (專案核心部分) | Controller + Model |
| Database | MySQL on Linux (Contained by Docker, name: xue-mi) | 數據庫 | Model 的根據 |

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

## 訂單開立流程 -> 完結的流程
1. 前端資料驗證
2. 將商品的數量寫入 (預扣) ---> ID
3. 利用 ID 去打第三方金流的 API 來產生第三方金流的訂單
4. 當使用者繳完錢之後，第三方金流服務商會打我們提供的資訊 Update API

## 有用資源
- TablePlus : 可以連接不同種類資料庫的工具
- 綠界開發資源：
    - API技術文件 [[連結](https://developers.ecpay.com.tw)]
    - 測試環境資料 [[連結](https://developers.ecpay.com.tw/?p=2856)]
    - AIO Node.js 版的 SDK 及範例 [[連結](https://github.com/ECPay/ECPayAIO_Node.js/tree/master)]
    - 廠商管理後台 (測試版) [[連結](https://vendor-stage.ecpay.com.tw/User/LogOn_Step1)]
- Paypal開發資源：
    - Developer 入口 [[連結](https://developer.paypal.com/home/)]
    - Javascript SDK 參考範例 [[連結](https://developer.paypal.com/sdk/js/reference)]
    - Checkout 串接標準範例 [[連結](https://developer.paypal.com/studio/checkout/standard/integrate)]
- ngrok : 將本機服務安全地暴露到網際網路 [[連結](https://ngrok.com)]