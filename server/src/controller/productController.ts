import { NextFunction, Request, Response } from "express";

export interface IProductController {
    findAll(req: Request<any, any, any, any>, res: Response, _next: NextFunction): void;
}

