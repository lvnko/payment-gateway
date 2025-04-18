import { ProductController, IProductController } from "@/controller/productController"
import { ModelContext } from "./modelManager"

export interface ControllerContext {
    productController: IProductController
}

export const controllerManager = ({
    modelCtx
}: {
    modelCtx: ModelContext
}): ControllerContext => {
    const productController = ProductController.createController({ productModel: modelCtx.productModel });

    return {
        productController
    }
}