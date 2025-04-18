import express from 'express';
import { ControllerContext } from '@/manager/controllerManager';

export const mountProductRouter = ({
    controllerCtx
}: {
    controllerCtx: ControllerContext
}) => {

    let router = express.Router();
}