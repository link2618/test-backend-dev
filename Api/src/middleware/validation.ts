import { Request, Response, NextFunction } from "express";

import { OrderRequest, Product } from "../types";

export const validateJsonBody = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (req.method === "POST" && !req.is("application/json")) {
        res.status(400).json({
            success: false,
            message: "El contenido debe ser application/json",
            error: "INVALID_CONTENT_TYPE",
            timestamp: new Date().toISOString(),
        });
        return;
    }
    next();
};

export const validateOrderStructure = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const body = req.body as OrderRequest;

    if (!body.products) {
        res.status(400).json({
            success: false,
            message: 'La propiedad "products" es requerida',
            error: "MISSING_PRODUCTS",
            timestamp: new Date().toISOString(),
        });
        return;
    }

    if (!Array.isArray(body.products)) {
        res.status(400).json({
            success: false,
            message: 'La propiedad "products" debe ser un array',
            error: "INVALID_PRODUCTS_TYPE",
            timestamp: new Date().toISOString(),
        });
        return;
    }

    if (body.products.length === 0) {
        res.status(400).json({
            success: false,
            message: "El array de productos no puede estar vacío",
            error: "EMPTY_PRODUCTS_ARRAY",
            timestamp: new Date().toISOString(),
        });
        return;
    }

    for (let i = 0; i < body.products.length; i++) {
        const product = body.products[i] as Product;
        const errors: string[] = [];

        if (!product.id || typeof product.id !== "string") {
            errors.push(
                `Producto ${i + 1}: "id" es requerido y debe ser string`
            );
        }

        if (!product.name || typeof product.name !== "string") {
            errors.push(
                `Producto ${i + 1}: "name" es requerido y debe ser string`
            );
        }

        if (typeof product.price !== "number" || product.price < 0) {
            errors.push(
                `Producto ${
                    i + 1
                }: "price" debe ser un número mayor o igual a 0`
            );
        }

        if (typeof product.quantity !== "number" || product.quantity <= 0) {
            errors.push(
                `Producto ${i + 1}: "quantity" debe ser un número mayor a 0`
            );
        }

        if (errors.length > 0) {
            res.status(400).json({
                success: false,
                message: "Errores de validación en los productos",
                error: "PRODUCT_VALIDATION_ERROR",
                details: errors,
                timestamp: new Date().toISOString(),
            });
            return;
        }
    }

    if (body.socioeconomicStratum !== undefined) {
        if (
            typeof body.socioeconomicStratum !== "number" ||
            body.socioeconomicStratum < 1 ||
            body.socioeconomicStratum > 6
        ) {
            res.status(400).json({
                success: false,
                message:
                    "El estrato socioeconómico debe ser un número entre 1 y 6",
                error: "INVALID_STRATUM",
                timestamp: new Date().toISOString(),
            });
            return;
        }
    }

    next();
};

export const requestLogger = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(
            `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
        );
    });

    next();
};

export const notFoundHandler = (_req: Request, res: Response): void => {
    res.status(404).json({
        success: false,
        message: "Endpoint no encontrado",
        error: "NOT_FOUND",
        timestamp: new Date().toISOString(),
    });
};

export const errorHandler = (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error("Error no manejado:", error);

    res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: "INTERNAL_SERVER_ERROR",
        timestamp: new Date().toISOString(),
    });
};
