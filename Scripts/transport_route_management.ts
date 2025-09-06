interface Stop {
    id: string;
    name: string;
    coordinates?: { lat: number; lng: number };
}

interface Route {
    id: string;
    name: string;
    stops: Set<string>; // IDs de paradas
    order: string[]; // Orden de las paradas en la ruta
}

class PublicTransportRouteSystem  {
    private routes: Map<string, Route> = new Map();
    
    private stopToRoutes: Map<string, Set<string>> = new Map();
    
    private stops: Map<string, Stop> = new Map();

    registerStop(stop: Stop): void {
        this.stops.set(stop.id, stop);
        if (!this.stopToRoutes.has(stop.id)) {
            this.stopToRoutes.set(stop.id, new Set());
        }
    }

    createRoute(id: string, name: string, orderedStops: string[] = []): void {
        if (this.routes.has(id)) {
            throw new Error(`La ruta ${id} ya existe`);
        }

        for (const stopId of orderedStops) {
            if (!this.stops.has(stopId)) {
                throw new Error(`La parada ${stopId} no está registrada`);
            }
        }

        const route: Route = {
            id,
            name,
            stops: new Set(orderedStops),
            order: [...orderedStops]
        };

        this.routes.set(id, route);

        for (const stopId of orderedStops) {
            this.stopToRoutes.get(stopId)!.add(id);
        }
    }

    getRoutesByStop(stopId: string): Route[] {
        const routeIds = this.stopToRoutes.get(stopId);
        if (!routeIds) {
            return [];
        }

        return Array.from(routeIds).map(routeId => this.routes.get(routeId)!);
    }

    addStopToRoute(routeId: string, stopId: string, position?: number): void {
        const route = this.routes.get(routeId);
        if (!route) {
            throw new Error(`La ruta ${routeId} no existe`);
        }

        if (!this.stops.has(stopId)) {
            throw new Error(`La parada ${stopId} no está registrada`);
        }

        if (route.stops.has(stopId)) {
            throw new Error(`La parada ${stopId} ya existe en la ruta ${routeId}`);
        }

        route.stops.add(stopId);

        if (position === undefined || position >= route.order.length) {
            route.order.push(stopId);
        } else {
            route.order.splice(Math.max(0, position), 0, stopId);
        }

        this.stopToRoutes.get(stopId)!.add(routeId);
    }

    removeStopFromRoute(routeId: string, stopId: string): void {
        const route = this.routes.get(routeId);
        if (!route) {
            throw new Error(`La ruta ${routeId} no existe`);
        }

        if (!route.stops.has(stopId)) {
            throw new Error(`La parada ${stopId} no existe en la ruta ${routeId}`);
        }

        route.stops.delete(stopId);

        const index = route.order.indexOf(stopId);
        if (index > -1) {
            route.order.splice(index, 1);
        }

        this.stopToRoutes.get(stopId)!.delete(routeId);
    }

    getRoute(routeId: string): Route | undefined {
        return this.routes.get(routeId);
    }

    getRouteStops(routeId: string): Stop[] {
        const route = this.routes.get(routeId);
        if (!route) {
            return [];
        }

        return route.order.map(stopId => this.stops.get(stopId)!);
    }

    routeHasStop(routeId: string, stopId: string): boolean {
        const route = this.routes.get(routeId);
        return route ? route.stops.has(stopId) : false;
    }

    getStatistics(): {
        totalRoutes: number;
        totalStops: number;
        mostConnectedStop: { stop: Stop; routeCount: number } | null;
    } {
        let mostConnectedStop: { stop: Stop; routeCount: number } | null = null;
        let maxRoutes = 0;

        for (const [stopId, routeSet] of this.stopToRoutes) {
            if (routeSet.size > maxRoutes) {
                maxRoutes = routeSet.size;
                mostConnectedStop = {
                    stop: this.stops.get(stopId)!,
                    routeCount: maxRoutes
                };
            }
        }

        return {
            totalRoutes: this.routes.size,
            totalStops: this.stops.size,
            mostConnectedStop
        };
    }
}

function main() {
    const system = new PublicTransportRouteSystem();

    system.registerStop({ id: "P001", name: "Terminal Centro" });
    system.registerStop({ id: "P002", name: "Plaza Mayor" });
    system.registerStop({ id: "P003", name: "Universidad" });
    system.registerStop({ id: "P004", name: "Hospital Regional" });
    system.registerStop({ id: "P005", name: "Estadio Municipal" });

    system.createRoute("R001", "Ruta Norte", ["P001", "P002", "P003"]);
    system.createRoute("R002", "Ruta Sur", ["P001", "P004", "P005"]);
    system.createRoute("R003", "Ruta Express", ["P002", "P003", "P004"]);

    console.log("=== Rutas que pasan por Terminal Centro ===");
    const terminalRoutes = system.getRoutesByStop("P001");
    terminalRoutes.forEach(route => {
        console.log(`${route.name} (${route.id}): ${route.order.join(" -> ")}`);
    });

    system.addStopToRoute("R001", "P004", 2); // Insertar en posición específica
    console.log("\n=== Después de agregar Hospital a Ruta Norte ===");
    const northRouteStops = system.getRouteStops("R001");
    console.log(northRouteStops.map(s => s.name).join(" -> "));

    console.log("\n=== Estadísticas del Sistema ===");
    const stats = system.getStatistics();
    console.log(`Total rutas: ${stats.totalRoutes}`);
    console.log(`Total paradas: ${stats.totalStops}`);
    if (stats.mostConnectedStop) {
        console.log(`Parada más conectada: ${stats.mostConnectedStop.stop.name} (${stats.mostConnectedStop.routeCount} rutas)`);
    }
}

main();

// deno task 1.2