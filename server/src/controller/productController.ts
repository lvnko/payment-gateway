import { IProductModel } from "@/model/products";
import { NextFunction, Request, Response } from "express";

interface ProductControllerProps {
    productModel: IProductModel;
}

export interface IProductController {
    findAll(
        req: Request<any, any, any, any>,
        res: Response,
        _next: NextFunction
    ): void;
}

export class ProductController implements IProductController {

    private productModel: IProductModel;

    public static createController({ productModel}: ProductControllerProps) {
        return new ProductController({ productModel });
    }

    constructor({ productModel }: ProductControllerProps) {
        this.productModel = productModel;
    }

    findAll: IProductController['findAll'] = async (_req, res, _next) => {
        const result = await this.productModel.findAll();
        res.json(result);
    }

}