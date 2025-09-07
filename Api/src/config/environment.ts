import dotenv from "dotenv";

dotenv.config();

export const envConfig = {
    server: {
        port: parseInt(process.env["PORT"] || "3000", 10),
        host: process.env["HOST"] || "localhost",
        nodeEnv: process.env["NODE_ENV"] || "development",
        apiVersion: process.env["API_VERSION"] || "v1",
    },

    cors: {
        origin: process.env["CORS_ORIGIN"] || "*",
        credentials: process.env["CORS_CREDENTIALS"] === "true",
        methods: process.env["CORS_METHODS"]?.split(",") || [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS",
        ],
        allowedHeaders: process.env["CORS_ALLOWED_HEADERS"]?.split(",") || [
            "Content-Type",
            "Authorization",
        ],
    },

    rateLimit: {
        windowMs: parseInt(process.env["RATE_LIMIT_WINDOW_MS"] || "900000", 10), // 15 minutos por defecto
        max: parseInt(process.env["RATE_LIMIT_MAX"] || "100", 10),
        message:
            process.env["RATE_LIMIT_MESSAGE"] ||
            "Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.",
    },

    logging: {
        level: process.env["LOG_LEVEL"] || "info",
        format: process.env["LOG_FORMAT"] || "combined",
        enableConsole: process.env["LOG_ENABLE_CONSOLE"] !== "false",
        enableFile: process.env["LOG_ENABLE_FILE"] === "true",
        filePath: process.env["LOG_FILE_PATH"] || "./logs/app.log",
    },

    security: {
        jwtSecret: process.env["JWT_SECRET"] || "secret-key",
        jwtExpiresIn: process.env["JWT_EXPIRES_IN"] || "24h",
        bcryptRounds: parseInt(process.env["BCRYPT_ROUNDS"] || "12", 10),
        enableHelmet: process.env["ENABLE_HELMET"] !== "false",
    },

    business: {
        // Configuración de envío
        shipping: {
            baseCost: parseInt(process.env["SHIPPING_BASE_COST"] || "8000", 10),
            freeShippingThreshold: parseInt(
                process.env["FREE_SHIPPING_THRESHOLD"] || "200000",
                10
            ),
            stratumMultipliers: {
                1: parseFloat(process.env["STRATUM_1_MULTIPLIER"] || "0.5"),
                2: parseFloat(process.env["STRATUM_2_MULTIPLIER"] || "0.7"),
                3: parseFloat(process.env["STRATUM_3_MULTIPLIER"] || "0.8"),
                4: parseFloat(process.env["STRATUM_4_MULTIPLIER"] || "1.0"),
                5: parseFloat(process.env["STRATUM_5_MULTIPLIER"] || "1.2"),
                6: parseFloat(process.env["STRATUM_6_MULTIPLIER"] || "1.5"),
            },
        },
        discounts: {
            // Descuentos por volumen
            volumeDiscounts: [
                {
                    minQuantity: parseInt(
                        process.env["VOLUME_DISCOUNT_1_QTY"] || "10",
                        10
                    ),
                    percentage: parseInt(
                        process.env["VOLUME_DISCOUNT_1_PCT"] || "5",
                        10
                    ),
                },
                {
                    minQuantity: parseInt(
                        process.env["VOLUME_DISCOUNT_2_QTY"] || "25",
                        10
                    ),
                    percentage: parseInt(
                        process.env["VOLUME_DISCOUNT_2_PCT"] || "10",
                        10
                    ),
                },
                {
                    minQuantity: parseInt(
                        process.env["VOLUME_DISCOUNT_3_QTY"] || "50",
                        10
                    ),
                    percentage: parseInt(
                        process.env["VOLUME_DISCOUNT_3_PCT"] || "15",
                        10
                    ),
                },
                {
                    minQuantity: parseInt(
                        process.env["VOLUME_DISCOUNT_4_QTY"] || "100",
                        10
                    ),
                    percentage: parseInt(
                        process.env["VOLUME_DISCOUNT_4_PCT"] || "20",
                        10
                    ),
                },
            ],
            // Descuentos por monto total
            totalAmountDiscounts: [
                {
                    minAmount: parseInt(
                        process.env["AMOUNT_DISCOUNT_1_MIN"] || "100000",
                        10
                    ),
                    percentage: parseInt(
                        process.env["AMOUNT_DISCOUNT_1_PCT"] || "5",
                        10
                    ),
                },
                {
                    minAmount: parseInt(
                        process.env["AMOUNT_DISCOUNT_2_MIN"] || "250000",
                        10
                    ),
                    percentage: parseInt(
                        process.env["AMOUNT_DISCOUNT_2_PCT"] || "10",
                        10
                    ),
                },
                {
                    minAmount: parseInt(
                        process.env["AMOUNT_DISCOUNT_3_MIN"] || "500000",
                        10
                    ),
                    percentage: parseInt(
                        process.env["AMOUNT_DISCOUNT_3_PCT"] || "15",
                        10
                    ),
                },
                {
                    minAmount: parseInt(
                        process.env["AMOUNT_DISCOUNT_4_MIN"] || "1000000",
                        10
                    ),
                    percentage: parseInt(
                        process.env["AMOUNT_DISCOUNT_4_PCT"] || "20",
                        10
                    ),
                },
            ],
            // Descuentos por estrato
            stratumDiscounts: [
                {
                    stratum: 1,
                    percentage: parseInt(
                        process.env["STRATUM_DISCOUNT_1"] || "10",
                        10
                    ),
                },
                {
                    stratum: 2,
                    percentage: parseInt(
                        process.env["STRATUM_DISCOUNT_2"] || "8",
                        10
                    ),
                },
                {
                    stratum: 3,
                    percentage: parseInt(
                        process.env["STRATUM_DISCOUNT_3"] || "5",
                        10
                    ),
                },
            ],
        },
    },

    monitoring: {
        enableMetrics: process.env["ENABLE_METRICS"] === "true",
        metricsPort: parseInt(process.env["METRICS_PORT"] || "9090", 10),
        enableHealthCheck: process.env["ENABLE_HEALTH_CHECK"] !== "false",
    },
} as const;

export const validateEnvironment = (): void => {
    const requiredVars = ["NODE_ENV"];

    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
        throw new Error(
            `Variables de entorno requeridas faltantes: ${missingVars.join(
                ", "
            )}`
        );
    }

    if (envConfig.server.port < 1 || envConfig.server.port > 65535) {
        throw new Error("PORT debe estar entre 1 y 65535");
    }

    if (
        envConfig.server.nodeEnv !== "development" &&
        envConfig.server.nodeEnv !== "production" &&
        envConfig.server.nodeEnv !== "test"
    ) {
        console.warn(
            `NODE_ENV tiene un valor inesperado: ${envConfig.server.nodeEnv}`
        );
    }
};

export const getEnvironmentConfig = () => {
    return {
        isDevelopment: envConfig.server.nodeEnv === "development",
        isProduction: envConfig.server.nodeEnv === "production",
        isTest: envConfig.server.nodeEnv === "test",
    };
};

export const defaultConfig = {
    server: {
        port: 3000,
        host: "localhost",
        nodeEnv: "development",
    },
    cors: {
        origin: "*",
        credentials: true,
    },
    rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 100,
    },
} as const;
