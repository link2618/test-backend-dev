import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import orderRoutes from "./routes/orderRoutes";
import { notFoundHandler, errorHandler } from "./middleware/validation";
import {
    envConfig,
    validateEnvironment,
    getEnvironmentConfig,
} from "./config/environment";

const app = express();

try {
    validateEnvironment();
    console.log("Variables de entorno validadas correctamente");
} catch (error) {
    console.error("Error en configuración de variables de entorno:", error);
    process.exit(1);
}

if (envConfig.security.enableHelmet) {
    app.use(helmet());
}

app.use(
    cors({
        origin: envConfig.cors.origin,
        credentials: envConfig.cors.credentials,
        methods: envConfig.cors.methods,
        allowedHeaders: envConfig.cors.allowedHeaders,
    })
);

app.use(
    rateLimit({
        windowMs: envConfig.rateLimit.windowMs,
        max: envConfig.rateLimit.max,
        message: envConfig.rateLimit.message,
    })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rutas de la API
app.use("/api/orders", orderRoutes);

app.get("/", (_req, res) => {
    const environmentInfo = getEnvironmentConfig();

    res.json({
        success: true,
        message: "API de Gestión de Pedidos - Jikkosoft",
        version: envConfig.server.apiVersion,
        environment: envConfig.server.nodeEnv,
        environmentInfo,
        endpoints: {
            calculate: "POST /api/orders/calculate",
            health: "GET /api/orders/health",
            config: "GET /api/orders/config",
        },
        timestamp: new Date().toISOString(),
    });
});

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = (): void => {
    const server = app.listen(
        envConfig.server.port,
        envConfig.server.host,
        () => {
            console.log(`Servidor iniciado en puerto ${envConfig.server.port}`);
            console.log(`Entorno: ${envConfig.server.nodeEnv}`);
            console.log(
                `URL: http://${envConfig.server.host}:${envConfig.server.port}`
            );
            console.log(
                `Documentación: http://${envConfig.server.host}:${envConfig.server.port}/api/orders/config`
            );

            if (envConfig.server.nodeEnv === "development") {
                console.log("\nConfiguración actual:");
                console.log(`   - CORS Origin: ${envConfig.cors.origin}`);
                console.log(
                    `   - Rate Limit: ${envConfig.rateLimit.max} requests/${
                        envConfig.rateLimit.windowMs / 1000
                    }s`
                );
                console.log(
                    `   - Shipping Base Cost: $${envConfig.business.shipping.baseCost} COP`
                );
                console.log(
                    `   - Free Shipping Threshold: $${envConfig.business.shipping.freeShippingThreshold} COP`
                );
            }
        }
    );

    // Manejo graceful de cierre
    process.on("SIGTERM", () => {
        console.log("Recibida señal SIGTERM, cerrando servidor...");
        server.close(() => {
            console.log("Servidor cerrado correctamente");
            process.exit(0);
        });
    });

    process.on("SIGINT", () => {
        console.log("Recibida señal SIGINT, cerrando servidor...");
        server.close(() => {
            console.log("Servidor cerrado correctamente");
            process.exit(0);
        });
    });
};

if (require.main === module) {
    startServer();
}

export default app;
