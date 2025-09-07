export interface Product {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

export interface OrderRequest {
    products: Product[];
    socioeconomicStratum?: number;
    deliveryAddress?: string;
}

export interface ShippingCost {
    baseCost: number;
    stratumMultiplier: number;
    finalCost: number;
}

export interface Discount {
    percentage: number;
    amount: number;
    type: "volume" | "total_amount" | "stratum";
}

export interface OrderCalculation {
    subtotal: number;
    shipping: ShippingCost;
    discount: Discount | null;
    total: number;
    products: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
        subtotal: number;
    }>;
}

export interface OrderResponse {
    success: boolean;
    data: OrderCalculation;
    message: string;
    timestamp: string;
}

export interface ErrorResponse {
    success: false;
    message: string;
    error: string;
    timestamp: string;
}

export interface DiscountConfig {
    readonly volumeDiscounts: readonly {
        readonly minQuantity: number;
        readonly percentage: number;
    }[];
    readonly totalAmountDiscounts: readonly {
        readonly minAmount: number;
        readonly percentage: number;
    }[];
    readonly stratumDiscounts: readonly {
        readonly stratum: number;
        readonly percentage: number;
    }[];
}

export interface ShippingConfig {
    baseCost: number;
    stratumMultipliers: Record<number, number>;
}
