import express from 'express';
import { ControllerContext } from '@/manager/controllerManager';

export const mountOrderRouter = ({
    controllerCtx
}: {
    controllerCtx: ControllerContext
}) => {

    let router = express.Router();
    const { createOrderValidator, createOrder } = controllerCtx.orderController

    router.post(
        '/create',
        // middleware 中介層：
        // 當 middleware 的 function 成功通過以後，才會執行後面的 function
        createOrderValidator(), // [!] 注意：這裡必須要當下執行。
        // controller create order 正式的內容
        createOrder
    );

    return router;
    
}