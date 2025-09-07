import { Request, Response } from "express";

import { OrderService } from "../services/OrderService";
import { OrderRequest, OrderResponse, ErrorResponse } from "../types";
import { envConfig } from "../config/environment";

export class OrderController {
    private orderService: OrderService;

    constructor() {
        this.orderService = new OrderService();
    }

    public calculateOrder = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const orderRequest: OrderRequest = req.body;

            if (!orderRequest || Object.keys(orderRequest).length === 0) {
                const errorResponse: ErrorResponse = {
                    success: false,
                    message: "El cuerpo de la petición no puede estar vacío",
                    error: "BAD_REQUEST",
                    timestamp: new Date().toISOString(),
                };
                res.status(400).json(errorResponse);
                return;
            }

            const calculation = this.orderService.calculateOrder(orderRequest);

            const successResponse: OrderResponse = {
                success: true,
                data: calculation,
                message: "Cálculo del pedido realizado exitosamente",
                timestamp: new Date().toISOString(),
            };

            res.status(200).json(successResponse);
        } catch (error) {
            this.handleError(error, res);
        }
    };

    public healthCheck = async (
        _req: Request,
        res: Response
    ): Promise<void> => {
        const healthResponse = {
            success: true,
            message: "API de gestión de pedidos funcionando correctamente",
            timestamp: new Date().toISOString(),
            version: "1.0.0",
            environment: envConfig.server.nodeEnv || "development",
        };

        res.status(200).json(healthResponse);
    };

    public getDiscountInfo = async (
        _req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const discountConfig = this.orderService.getDiscountConfig();
            const shippingConfig = this.orderService.getShippingConfig();

            const infoResponse = {
                success: true,
                data: {
                    discounts: discountConfig,
                    shipping: shippingConfig,
                },
                message: "Información de configuración obtenida exitosamente",
                timestamp: new Date().toISOString(),
            };

            res.status(200).json(infoResponse);
        } catch (error) {
            this.handleError(error, res);
        }
    };

    private handleError(error: unknown, res: Response): void {
        console.error("Error en OrderController:", error);

        let statusCode = 500;
        let errorMessage = "Error interno del servidor";
        let errorType = "INTERNAL_SERVER_ERROR";

        if (error instanceof Error) {
            // Errores de validación del servicio
            if (
                error.message.includes("debe contener") ||
                error.message.includes("debe estar") ||
                error.message.includes("no puede ser") ||
                error.message.includes("debe ser mayor")
            ) {
                statusCode = 400;
                errorMessage = error.message;
                errorType = "VALIDATION_ERROR";
            }
        }

        const errorResponse: ErrorResponse = {
            success: false,
            message: errorMessage,
            error: errorType,
            timestamp: new Date().toISOString(),
        };

        res.status(statusCode).json(errorResponse);
    }
}
