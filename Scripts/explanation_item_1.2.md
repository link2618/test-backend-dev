## 🏗️ Solución: Tres Estructuras de Datos Trabajando Juntas

### 1. **Map de Rutas** (`routes: Map<string, Route>`)
```typescript
// Almacena todas las rutas por su ID
routes: Map<string, Route> = new Map();
```

**¿Qué hace?**
- Guarda cada ruta usando su ID como clave
- Acceso súper rápido
- Como un diccionario: "Dame la ruta R001" → respuesta inmediata

**Ejemplo:**
```
R001 → { id: "R001", name: "Ruta Norte", stops: Set(["P001", "P002"]), order: ["P001", "P002"] }
R002 → { id: "R002", name: "Ruta Sur", stops: Set(["P001", "P003"]), order: ["P001", "P003"] }
```

### 2. **Índice Inverso** (`stopToRoutes: Map<string, Set<string>>`)
```typescript
// Para cada parada, guarda qué rutas la contienen
stopToRoutes: Map<string, Set<string>> = new Map();
```

**¿Qué hace?**
- Es como un "índice invertido" - en lugar de buscar rutas que contengan una parada
- Pre-calculamos qué rutas pasan por cada parada
- Acceso súper rápido

**Ejemplo:**
```
P001 → Set(["R001", "R002"])  // La parada P001 está en las rutas R001 y R002
P002 → Set(["R001"])          // La parada P002 solo está en la ruta R001
P003 → Set(["R002"])          // La parada P003 solo está en la ruta R002
```

### 3. **Catálogo de Paradas** (`stops: Map<string, Stop>`)
```typescript
// Información completa de cada parada
stops: Map<string, Stop> = new Map();
```

**¿Qué hace?**
- Guarda la información completa de cada parada (nombre, coordenadas, etc.)
- Validación: antes de añadir una parada a una ruta, verificamos que existe
- Acceso rápido

## 🔍 ¿Cómo Funciona la Magia?

### Consulta: "¿Qué rutas pasan por la parada P001?"

**❌ Enfoque Ineficiente (sin índice inverso):**
```typescript
// Tendríamos que revisar TODAS las rutas
function getRoutesByStop(stopId: string) {
    const result = [];
    for (const route of allRoutes) {  // Lento!
        if (route.stops.includes(stopId)) {
            result.push(route);
        }
    }
    return result;
}
```

**✅ Enfoque Eficiente:**
```typescript
function getRoutesByStop(stopId: string): Route[] {
    const routeIds = this.stopToRoutes.get(stopId);  // Súper rápido!
    if (!routeIds) return [];
    
    return Array.from(routeIds).map(routeId => this.routes.get(routeId)!);
}
```

### Operaciones Principales y su Complejidad

| Operación | Complejidad | ¿Por qué? |
|-----------|-------------|-----------|
| **Buscar rutas por parada** | O(k) | k = número de rutas que pasan por esa parada |
| **Añadir parada a ruta** | O(1) promedio | Set.add() es O(1), actualizar índice es O(1) |
| **Eliminar parada de ruta** | O(n) | n = número de paradas en la ruta (por el array) |
| **Verificar si parada existe en ruta** | O(1) | Set.has() es O(1) |
| **Obtener ruta por ID** | O(1) | Map.get() es O(1) |

## 🧠 ¿Por qué se eliguio estas estructuras?

### **Map vs Array vs Object**

| Estructura | Acceso por ID | Inserción | Eliminación | ¿Cuándo usar? |
|------------|---------------|-----------|-------------|----------------|
| **Map** | O(1) | O(1) | O(1) | ✅ **Nuestro caso** - IDs únicos |
| **Array** | O(n) | O(1) | O(n) | ❌ Lento para búsquedas |
| **Object** | O(1) | O(1) | O(1) | ⚠️ Similar a Map, pero menos funcional |

### **Set vs Array para Paradas**

```typescript
// ❌ Con Array - lento para verificar existencia
stops: string[] = ["P001", "P002", "P003"];
if (stops.includes("P001")) { ... }  // Llento!

// ✅ Con Set - rápido para verificar existencia
stops: Set<string> = new Set(["P001", "P002", "P003"]);
if (stops.has("P001")) { ... }  // Rápido!
```

## 📊 Comparación de Rendimiento

### Escenario: Ciudad con 1000 rutas, 5000 paradas

| Operación | Sin Índice Inverso | Con Nuestra Solución | Mejora |
|-----------|-------------------|----------------------|--------|
| Buscar rutas por parada | O(1000) = 1000 operaciones | O(k) ≈ 5 operaciones | **200x más rápido** |
| Verificar parada en ruta | O(20) = 20 operaciones | O(1) = 1 operación | **20x más rápido** |

## 🎨 Patrones de Diseño Utilizados

### 1. **Índice Inverso (Reverse Index)**
- Pre-calculamos relaciones para consultas rápidas
- Usado en motores de búsqueda (Google, Elasticsearch)

### 2. **Separación de Responsabilidades**
- `routes`: almacena rutas
- `stopToRoutes`: índice para consultas
- `stops`: catálogo de paradas

### 3. **Validación Temprana**
- Verificamos que las paradas existan antes de usarlas
- Evitamos errores en tiempo de ejecución

## 🚀 Ventajas de esta solución

### ✅ **Ventajas:**
1. **Consultas súper rápidas**: O(1) para la mayoría de operaciones
2. **Escalable**: funciona bien con miles de rutas y paradas
3. **Memoria eficiente**: solo guardamos lo necesario
4. **Fácil de mantener**: código claro y bien documentado
5. **Flexible**: fácil añadir nuevas funcionalidades

### ⚠️ **Trade-offs:**
1. **Memoria adicional**: el índice inverso usa espacio extra
2. **Sincronización**: debemos mantener 3 estructuras consistentes
3. **Complejidad**: más código que una solución simple

## 🔧 Cómo Usar el Sistema

```typescript
// 1. Crear el sistema
const system = new PublicTransportRouteSystem();

// 2. Registrar paradas
system.registerStop({ id: "P001", name: "Terminal Centro" });
system.registerStop({ id: "P002", name: "Plaza Mayor" });

// 3. Crear rutas
system.createRoute("R001", "Ruta Norte", ["P001", "P002"]);

// 4. Consultas eficientes
const rutas = system.getRoutesByStop("P001");  // ¡Súper rápido!
console.log(`La parada P001 está en ${rutas.length} rutas`);

// 5. Modificar rutas
system.addStopToRoute("R001", "P003", 1);  // Insertar en posición específica
```
