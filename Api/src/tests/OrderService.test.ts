import { OrderService } from "../services/OrderService";
import { OrderRequest } from "../types";

describe("OrderService", () => {
    let orderService: OrderService;

    beforeEach(() => {
        orderService = new OrderService();
    });

    describe("Validación de entrada", () => {
        it("debería lanzar error si no hay productos", () => {
            const orderRequest: OrderRequest = {
                products: [],
            };

            expect(() => orderService.calculateOrder(orderRequest)).toThrow(
                "El pedido debe contener al menos un producto"
            );
        });

        it("debería lanzar error si el estrato está fuera del rango válido", () => {
            const orderRequest: OrderRequest = {
                products: [
                    { id: "1", name: "Producto 1", price: 10000, quantity: 1 },
                ],
                socioeconomicStratum: 7,
            };

            expect(() => orderService.calculateOrder(orderRequest)).toThrow(
                "El estrato socioeconómico debe estar entre 1 y 6"
            );
        });

        it("debería lanzar error si un producto tiene precio negativo", () => {
            const orderRequest: OrderRequest = {
                products: [
                    { id: "1", name: "Producto 1", price: -1000, quantity: 1 },
                ],
            };

            expect(() => orderService.calculateOrder(orderRequest)).toThrow(
                "El precio del producto no puede ser negativo"
            );
        });

        it("debería lanzar error si un producto tiene cantidad cero o negativa", () => {
            const orderRequest: OrderRequest = {
                products: [
                    { id: "1", name: "Producto 1", price: 10000, quantity: 0 },
                ],
            };

            expect(() => orderService.calculateOrder(orderRequest)).toThrow(
                "La cantidad del producto debe ser mayor a 0"
            );
        });
    });

    describe("Cálculo de subtotal", () => {
        it("debería calcular correctamente el subtotal de productos", () => {
            const orderRequest: OrderRequest = {
                products: [
                    { id: "1", name: "Producto 1", price: 10000, quantity: 2 },
                    { id: "2", name: "Producto 2", price: 15000, quantity: 1 },
                ],
            };

            const result = orderService.calculateOrder(orderRequest);

            expect(result.subtotal).toBe(35000); // (10000 * 2) + (15000 * 1)
            expect(result.products).toHaveLength(2);
            expect(result.products?.[0]?.subtotal).toBe(20000);
            expect(result.products?.[1]?.subtotal).toBe(15000);
        });
    });

    describe("Cálculo de envío", () => {
        it("debería calcular envío gratuito para pedidos mayores a 200,000 COP", () => {
            const orderRequest: OrderRequest = {
                products: [
                    { id: "1", name: "Producto 1", price: 250000, quantity: 1 },
                ],
            };

            const result = orderService.calculateOrder(orderRequest);

            expect(result.shipping.finalCost).toBe(0);
            expect(result.shipping.baseCost).toBe(8000);
        });

        it("debería aplicar multiplicador correcto para estrato 1", () => {
            const orderRequest: OrderRequest = {
                products: [
                    { id: "1", name: "Producto 1", price: 50000, quantity: 1 },
                ],
                socioeconomicStratum: 1,
            };

            const result = orderService.calculateOrder(orderRequest);

            expect(result.shipping.stratumMultiplier).toBe(0.5);
            expect(result.shipping.finalCost).toBe(4000); // 8000 * 0.5
        });

        it("debería aplicar multiplicador correcto para estrato 6", () => {
            const orderRequest: OrderRequest = {
                products: [
                    { id: "1", name: "Producto 1", price: 50000, quantity: 1 },
                ],
                socioeconomicStratum: 6,
            };

            const result = orderService.calculateOrder(orderRequest);

            expect(result.shipping.stratumMultiplier).toBe(1.5);
            expect(result.shipping.finalCost).toBe(12000); // 8000 * 1.5
        });

        it("debería usar estrato 4 por defecto si no se especifica", () => {
            const orderRequest: OrderRequest = {
                products: [
                    { id: "1", name: "Producto 1", price: 50000, quantity: 1 },
                ],
            };

            const result = orderService.calculateOrder(orderRequest);

            expect(result.shipping.stratumMultiplier).toBe(1.0);
            expect(result.shipping.finalCost).toBe(8000); // 8000 * 1.0
        });
    });

    describe("Cálculo de descuentos", () => {
        it("debería aplicar descuento por volumen (10+ productos)", () => {
            const orderRequest: OrderRequest = {
                products: [
                    { id: "1", name: "Producto 1", price: 10000, quantity: 10 },
                ],
            };

            const result = orderService.calculateOrder(orderRequest);

            expect(result.discount).not.toBeNull();
            expect(result.discount?.type).toBe("volume");
            expect(result.discount?.percentage).toBe(5);
            expect(result.discount?.amount).toBe(5000); // 100000 * 0.05
        });

        it("debería aplicar descuento por monto total (100k+ COP)", () => {
            const orderRequest: OrderRequest = {
                products: [
                    { id: "1", name: "Producto 1", price: 120000, quantity: 1 },
                ],
            };

            const result = orderService.calculateOrder(orderRequest);

            expect(result.discount).not.toBeNull();
            expect(result.discount?.type).toBe("total_amount");
            expect(result.discount?.percentage).toBe(5);
            expect(result.discount?.amount).toBe(6000); // 120000 * 0.05
        });

        it("debería aplicar descuento por estrato socioeconómico", () => {
            const orderRequest: OrderRequest = {
                products: [
                    { id: "1", name: "Producto 1", price: 50000, quantity: 1 },
                ],
                socioeconomicStratum: 1,
            };

            const result = orderService.calculateOrder(orderRequest);

            expect(result.discount).not.toBeNull();
            expect(result.discount?.type).toBe("stratum");
            expect(result.discount?.percentage).toBe(10);
            expect(result.discount?.amount).toBe(5000); // 50000 * 0.10
        });

        it("debería aplicar el descuento más alto cuando hay múltiples opciones", () => {
            const orderRequest: OrderRequest = {
                products: [
                    {
                        id: "1",
                        name: "Producto 1",
                        price: 100000,
                        quantity: 25,
                    },
                ],
                socioeconomicStratum: 1,
            };

            const result = orderService.calculateOrder(orderRequest);

            expect(result.discount).not.toBeNull();
            expect(result.discount?.percentage).toBeGreaterThanOrEqual(10);
        });

        it("debería retornar null si no aplica ningún descuento", () => {
            const orderRequest: OrderRequest = {
                products: [
                    { id: "1", name: "Producto 1", price: 50000, quantity: 1 },
                ],
                socioeconomicStratum: 4, // Sin descuento por estrato
            };

            const result = orderService.calculateOrder(orderRequest);

            expect(result.discount).toBeNull();
        });
    });

    describe("Cálculo del total final", () => {
        it("debería calcular el total correctamente con todos los componentes", () => {
            const orderRequest: OrderRequest = {
                products: [
                    { id: "1", name: "Producto 1", price: 100000, quantity: 1 },
                ],
                socioeconomicStratum: 1,
            };

            const result = orderService.calculateOrder(orderRequest);

            // Subtotal: 100000
            // Envío: 8000 * 0.5 = 4000
            // Descuento: 100000 * 0.10 = 10000
            // Total: 100000 + 4000 - 10000 = 94000
            expect(result.total).toBe(94000);
        });

        it("debería asegurar que el total nunca sea negativo", () => {
            const orderRequest: OrderRequest = {
                products: [
                    { id: "1", name: "Producto 1", price: 1000, quantity: 1 },
                ],
                socioeconomicStratum: 1,
            };

            const result = orderService.calculateOrder(orderRequest);

            // Subtotal: 1000
            // Envío: 8000 * 0.5 = 4000
            // Descuento: 1000 * 0.10 = 100
            // Total: 1000 + 4000 - 100 = 4900
            expect(result.total).toBeGreaterThanOrEqual(0);
        });
    });

    describe("Casos de uso complejos", () => {
        it("debería manejar pedido grande con múltiples productos y descuentos", () => {
            const orderRequest: OrderRequest = {
                products: [
                    { id: "1", name: "Producto 1", price: 50000, quantity: 5 },
                    { id: "2", name: "Producto 2", price: 30000, quantity: 3 },
                    { id: "3", name: "Producto 3", price: 20000, quantity: 2 },
                ],
                socioeconomicStratum: 2,
            };

            const result = orderService.calculateOrder(orderRequest);

            expect(result.subtotal).toBe(380000); // (50000*5) + (30000*3) + (20000*2)
            expect(result.products).toHaveLength(3);
            expect(result.shipping.finalCost).toBe(0);
            expect(result.discount).not.toBeNull();
            expect(result.total).toBeGreaterThan(0);
        });

        it("debería manejar productos con precios decimales correctamente", () => {
            const orderRequest: OrderRequest = {
                products: [
                    {
                        id: "1",
                        name: "Producto 1",
                        price: 9999.99,
                        quantity: 2,
                    },
                ],
            };

            const result = orderService.calculateOrder(orderRequest);

            expect(result.subtotal).toBe(19999.98);
            expect(result.total).toBeGreaterThan(0);
        });
    });

    describe("Configuración", () => {
        it("debería retornar la configuración de descuentos", () => {
            const config = orderService.getDiscountConfig();

            expect(config.volumeDiscounts).toBeDefined();
            expect(config.totalAmountDiscounts).toBeDefined();
            expect(config.stratumDiscounts).toBeDefined();
            expect(Array.isArray(config.volumeDiscounts)).toBe(true);
        });

        it("debería retornar la configuración de envío", () => {
            const config = orderService.getShippingConfig();

            expect(config.baseCost).toBeDefined();
            expect(config.stratumMultipliers).toBeDefined();
            expect(typeof config.baseCost).toBe("number");
            expect(typeof config.stratumMultipliers).toBe("object");
        });
    });
});
