import { Router } from "express";

import { OrderController } from "../controllers/OrderController";
import {
    validateJsonBody,
    validateOrderStructure,
    requestLogger,
} from "../middleware/validation";

const router = Router();
const orderController = new OrderController();

router.use(requestLogger);
router.use(validateJsonBody);

/**
 * @route POST /api/orders/calculate
 * @desc Calcula el costo total de un pedido incluyendo envío y descuentos
 * @access Public
 */
router.post(
    "/calculate",
    validateOrderStructure,
    orderController.calculateOrder
);

/**
 * @route GET /api/orders/health
 * @desc Verifica el estado de la API
 * @access Public
 */
router.get("/health", orderController.healthCheck);

/**
 * @route GET /api/orders/config
 * @desc Obtiene información sobre la configuración de descuentos y envío
 * @access Public
 */
router.get("/config", orderController.getDiscountInfo);

export default router;
