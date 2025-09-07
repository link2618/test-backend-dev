import {
    OrderRequest,
    OrderCalculation,
    Product,
    ShippingCost,
    Discount,
    DiscountConfig,
    ShippingConfig,
} from "../types";
import { envConfig } from "../config/environment";

export class OrderService {
    private readonly discountConfig: DiscountConfig;
    private readonly shippingConfig: ShippingConfig;

    constructor() {
        this.discountConfig = envConfig.business.discounts;

        this.shippingConfig = {
            baseCost: envConfig.business.shipping.baseCost,
            stratumMultipliers: envConfig.business.shipping.stratumMultipliers,
        };
    }

    public calculateOrder(orderRequest: OrderRequest): OrderCalculation {
        this.validateOrderRequest(orderRequest);

        const products = this.calculateProductSubtotals(orderRequest.products);
        const subtotal = products.reduce(
            (sum, product) => sum + product.subtotal,
            0
        );

        const shipping = this.calculateShippingCost(
            orderRequest.socioeconomicStratum ?? 4,
            subtotal
        );

        const discount = this.calculateDiscount(
            orderRequest.products,
            subtotal,
            orderRequest.socioeconomicStratum ?? 4
        );

        const total = subtotal + shipping.finalCost - (discount?.amount ?? 0);

        return {
            subtotal,
            shipping,
            discount,
            total: Math.max(0, total),
            products,
        };
    }

    private validateOrderRequest(orderRequest: OrderRequest): void {
        if (!orderRequest.products || orderRequest.products.length === 0) {
            throw new Error("El pedido debe contener al menos un producto");
        }

        if (
            orderRequest.socioeconomicStratum &&
            (orderRequest.socioeconomicStratum < 1 ||
                orderRequest.socioeconomicStratum > 6)
        ) {
            throw new Error("El estrato socioeconómico debe estar entre 1 y 6");
        }

        for (const product of orderRequest.products) {
            if (!product.id || !product.name) {
                throw new Error(
                    "Cada producto debe tener un ID y nombre válidos"
                );
            }
            if (product.price < 0) {
                throw new Error("El precio del producto no puede ser negativo");
            }
            if (product.quantity <= 0) {
                throw new Error("La cantidad del producto debe ser mayor a 0");
            }
        }
    }

    private calculateProductSubtotals(products: Product[]) {
        return products.map((product) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            subtotal: product.price * product.quantity,
        }));
    }

    private calculateShippingCost(
        stratum: number,
        subtotal: number
    ): ShippingCost {
        const multiplier =
            this.shippingConfig.stratumMultipliers[stratum] ?? 1.0;
        const baseCost = this.shippingConfig.baseCost;

        // Envío gratuito para pedidos mayores al umbral configurado
        if (subtotal >= envConfig.business.shipping.freeShippingThreshold) {
            return {
                baseCost,
                stratumMultiplier: multiplier,
                finalCost: 0,
            };
        }

        const finalCost = Math.round(baseCost * multiplier);

        return {
            baseCost,
            stratumMultiplier: multiplier,
            finalCost,
        };
    }

    private calculateDiscount(
        products: Product[],
        subtotal: number,
        stratum: number
    ): Discount | null {
        const discounts: Discount[] = [];

        // Descuento por volumen
        const totalQuantity = products.reduce(
            (sum, product) => sum + product.quantity,
            0
        );
        const volumeDiscount = this.getVolumeDiscount(totalQuantity);
        if (volumeDiscount) {
            discounts.push(volumeDiscount);
        }

        // Descuento por monto total
        const totalAmountDiscount = this.getTotalAmountDiscount(subtotal);
        if (totalAmountDiscount) {
            discounts.push(totalAmountDiscount);
        }

        // Descuento por estrato
        const stratumDiscount = this.getStratumDiscount(stratum);
        if (stratumDiscount) {
            discounts.push(stratumDiscount);
        }

        // Retornar el descuento más alto
        if (discounts.length === 0) {
            return null;
        }

        const bestDiscount = discounts.reduce((best, current) =>
            current.percentage > best.percentage ? current : best
        );

        return {
            ...bestDiscount,
            amount: Math.round((subtotal * bestDiscount.percentage) / 100),
        };
    }

    private getVolumeDiscount(totalQuantity: number): Discount | null {
        const applicableDiscount = this.discountConfig.volumeDiscounts
            .filter((discount) => totalQuantity >= discount.minQuantity)
            .sort((a, b) => b.percentage - a.percentage)[0];

        if (!applicableDiscount) {
            return null;
        }

        return {
            percentage: applicableDiscount.percentage,
            amount: 0,
            type: "volume",
        };
    }

    private getTotalAmountDiscount(subtotal: number): Discount | null {
        const applicableDiscount = this.discountConfig.totalAmountDiscounts
            .filter((discount) => subtotal >= discount.minAmount)
            .sort((a, b) => b.percentage - a.percentage)[0];

        if (!applicableDiscount) {
            return null;
        }

        return {
            percentage: applicableDiscount.percentage,
            amount: 0,
            type: "total_amount",
        };
    }

    private getStratumDiscount(stratum: number): Discount | null {
        const applicableDiscount = this.discountConfig.stratumDiscounts.find(
            (discount) => discount.stratum === stratum
        );

        if (!applicableDiscount) {
            return null;
        }

        return {
            percentage: applicableDiscount.percentage,
            amount: 0,
            type: "stratum",
        };
    }

    public getDiscountConfig(): DiscountConfig {
        return { ...this.discountConfig };
    }

    public getShippingConfig(): ShippingConfig {
        return { ...this.shippingConfig };
    }
}
