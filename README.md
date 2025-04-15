# Week #013 ~ #016
## 專案啟動步驟
```shell
cd mysql
docker-compose up -d
```

## 架構
| 架構中所屬層次 | 技術工具/框架 | 角色 |
|---|---|---|
| Client | 未知 | Frontend renderer (前台網頁渲染) |
| Backend | Node.js (Gen Express.js by Typescript) | Web service (專案核心部分) |
| Database | MySQL on Linux (Contained by Docker, name: xue-mi) | 數據庫 |

## 有用資源
- TablePlus : 可以連接不同種類資料庫的工具
