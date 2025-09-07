import { envConfig } from "./environment";

export const developmentConfig = {
    ...envConfig,
    server: {
        ...envConfig.server,
        port: 3000,
        host: "localhost",
    },
    logging: {
        ...envConfig.logging,
        level: "debug",
        enableConsole: true,
    },
    business: {
        ...envConfig.business,
        shipping: {
            ...envConfig.business.shipping,
            baseCost: 5000,
        },
    },
};

export const productionConfig = {
    ...envConfig,
    server: {
        ...envConfig.server,
        port: process.env["PORT"] || 8080,
        host: "0.0.0.0",
    },
    logging: {
        ...envConfig.logging,
        level: "warn",
        enableConsole: false,
        enableFile: true,
    },
    security: {
        ...envConfig.security,
        enableHelmet: true,
    },
    cors: {
        ...envConfig.cors,
        origin: process.env["CORS_ORIGIN"] || "*",
        credentials: true,
    },
};

export const testConfig = {
    ...envConfig,
    server: {
        ...envConfig.server,
        port: 0,
        host: "localhost",
    },
    logging: {
        ...envConfig.logging,
        level: "error",
        enableConsole: false,
    },
    business: {
        ...envConfig.business,
        shipping: {
            ...envConfig.business.shipping,
            baseCost: 1000,
        },
    },
};

export const getConfigForEnvironment = () => {
    switch (envConfig.server.nodeEnv) {
        case "development":
            return developmentConfig;
        case "production":
            return productionConfig;
        case "test":
            return testConfig;
        default:
            return envConfig;
    }
};

export const exampleUsage = () => {
    const config = getConfigForEnvironment();

    console.log("Configuración actual:", {
        environment: config.server.nodeEnv,
        port: config.server.port,
        host: config.server.host,
        shippingBaseCost: config.business.shipping.baseCost,
        logLevel: config.logging.level,
    });
};
