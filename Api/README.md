# 🛒 API de Gestión de Pedidos - Jikkosoft

Una API RESTful desarrollada en Node.js con TypeScript que gestiona el cálculo de costos de pedidos, incluyendo envío a domicilio y descuentos basados en el sistema de estratos socioeconómicos de Colombia.

## 📋 Características

- ✅ **Cálculo automático de costos** de productos y envío
- 🏠 **Sistema de envío a domicilio** con costos variables por estrato socioeconómico
- 💰 **Descuentos inteligentes** por volumen, monto total y estrato
- 🇨🇴 **Adaptado al contexto colombiano** con sistema de estratos (1-6)
- 🧪 **Cobertura completa de tests** unitarios
- 🔒 **Validación robusta** de datos de entrada
- 📚 **Documentación completa** con ejemplos de uso

## 🚀 Instalación y Configuración

### Prerequisitos

- Node.js 18.0.0 o superior
- npm o yarn

### Instalación

```bash
git clone <repository-url>
cd "Api"

npm install

# Configurar variables de entorno
cp env.example .env
# Editar el archivo .env con tus configuraciones

# Compilar TypeScript
npm run build

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar en modo producción
npm start
```

### Scripts Disponibles

```bash
npm run build      # Compilar TypeScript
npm run start      # Ejecutar en producción
npm run dev        # Ejecutar en desarrollo
npm test           # Ejecutar tests
npm run test:watch # Ejecutar tests en modo watch
npm run lint       # Verificar código con ESLint
npm run lint:fix   # Corregir problemas de ESLint
```

## 📖 Documentación de la API

### Base URL

```
<!-- Verificar puerto en el archivo .env -->
http://localhost:4000
```

### Endpoints Disponibles

#### 1. Calcular Pedido

**POST** `/api/orders/calculate`

Calcula el costo total de un pedido incluyendo envío y descuentos.

**Request Body:**

```json
{
  "products": [
    {
      "id": "PROD001",
      "name": "Laptop Gaming",
      "price": 2500000,
      "quantity": 1
    },
    {
      "id": "PROD002", 
      "name": "Mouse Inalámbrico",
      "price": 45000,
      "quantity": 2
    }
  ],
  "socioeconomicStratum": 3,
  "deliveryAddress": "Calle 123 #45-67, Bogotá"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "subtotal": 2590000,
    "shipping": {
      "baseCost": 8000,
      "stratumMultiplier": 0.8,
      "finalCost": 6400
    },
    "discount": {
      "percentage": 15,
      "amount": 388500,
      "type": "total_amount"
    },
    "total": 2211500,
    "products": [
      {
        "id": "PROD001",
        "name": "Laptop Gaming",
        "price": 2500000,
        "quantity": 1,
        "subtotal": 2500000
      },
      {
        "id": "PROD002",
        "name": "Mouse Inalámbrico", 
        "price": 45000,
        "quantity": 2,
        "subtotal": 90000
      }
    ]
  },
  "message": "Cálculo del pedido realizado exitosamente",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 2. Estado de la API

**GET** `/api/orders/health`

Verifica el estado de la API.

**Response:**

```json
{
  "success": true,
  "message": "API de gestión de pedidos funcionando correctamente",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "development"
}
```

#### 3. Configuración

**GET** `/api/orders/config`

Obtiene información sobre la configuración de descuentos y envío.

**Response:**

```json
{
  "success": true,
  "data": {
    "discounts": {
      "volumeDiscounts": [
        { "minQuantity": 10, "percentage": 5 },
        { "minQuantity": 25, "percentage": 10 },
        { "minQuantity": 50, "percentage": 15 },
        { "minQuantity": 100, "percentage": 20 }
      ],
      "totalAmountDiscounts": [
        { "minAmount": 100000, "percentage": 5 },
        { "minAmount": 250000, "percentage": 10 },
        { "minAmount": 500000, "percentage": 15 },
        { "minAmount": 1000000, "percentage": 20 }
      ],
      "stratumDiscounts": [
        { "stratum": 1, "percentage": 10 },
        { "stratum": 2, "percentage": 8 },
        { "stratum": 3, "percentage": 5 }
      ]
    },
    "shipping": {
      "baseCost": 8000,
      "stratumMultipliers": {
        "1": 0.5,
        "2": 0.7,
        "3": 0.8,
        "4": 1.0,
        "5": 1.2,
        "6": 1.5
      }
    }
  },
  "message": "Información de configuración obtenida exitosamente",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 💰 Sistema de Descuentos

### Descuentos por Volumen

| Cantidad Mínima | Descuento |
|----------------|-----------|
| 10+ productos  | 5%        |
| 25+ productos  | 10%       |
| 50+ productos  | 15%       |
| 100+ productos | 20%       |

### Descuentos por Monto Total

| Monto Mínimo | Descuento |
|-------------|-----------|
| $100,000 COP | 5%        |
| $250,000 COP | 10%       |
| $500,000 COP | 15%       |
| $1,000,000 COP | 20%     |

### Descuentos por Estrato Socioeconómico

| Estrato | Descuento |
|---------|-----------|
| 1       | 10%       |
| 2       | 8%        |
| 3       | 5%        |
| 4-6     | Sin descuento |

## 🚚 Sistema de Envío

### Costos Base por Estrato

| Estrato | Multiplicador | Costo (Base: $8,000) |
|---------|---------------|---------------------|
| 1       | 0.5x          | $4,000              |
| 2       | 0.7x          | $5,600              |
| 3       | 0.8x          | $6,400              |
| 4       | 1.0x          | $8,000              |
| 5       | 1.2x          | $9,600              |
| 6       | 1.5x          | $12,000             |

### Envío Gratuito

- **Pedidos superiores a $200,000 COP** tienen envío gratuito independientemente del estrato.

## 🧪 Testing

### Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Generar reporte de cobertura
npm test -- --coverage
```

### Cobertura de Tests

Los tests cubren:

- ✅ Validación de datos de entrada
- ✅ Cálculo de subtotales
- ✅ Cálculo de costos de envío por estrato
- ✅ Aplicación de descuentos (volumen, monto, estrato)
- ✅ Cálculo del total final
- ✅ Casos edge y manejo de errores
- ✅ Configuración del servicio

## 📝 Ejemplos de Uso

### Ejemplo 1: Pedido Pequeño (Estrato 1)

```bash
curl -X POST http://localhost:3000/api/orders/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {
        "id": "PROD001",
        "name": "Libro de Programación",
        "price": 50000,
        "quantity": 1
      }
    ],
    "socioeconomicStratum": 1
  }'
```

**Resultado esperado:**
- Subtotal: $50,000
- Envío: $4,000 (50% del costo base configurado en `STRATUM_1_MULTIPLIER`)
- Descuento: $5,000 (10% por estrato configurado en `STRATUM_DISCOUNT_1`)
- **Total: $49,000**

### Ejemplo 2: Pedido Grande (Estrato 6)

```bash
curl -X POST http://localhost:3000/api/orders/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {
        "id": "PROD001",
        "name": "Smartphone Premium",
        "price": 1200000,
        "quantity": 1
      },
      {
        "id": "PROD002",
        "name": "Auriculares",
        "price": 150000,
        "quantity": 1
      }
    ],
    "socioeconomicStratum": 6
  }'
```

**Resultado esperado:**
- Subtotal: $1,350,000
- Envío: $0 (envío gratuito por monto alto configurado en `FREE_SHIPPING_THRESHOLD`)
- Descuento: $270,000 (20% por monto total configurado en `AMOUNT_DISCOUNT_4_PCT`)
- **Total: $1,080,000**

### Ejemplo 3: Pedido con Múltiples Descuentos

```bash
curl -X POST http://localhost:3000/api/orders/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {
        "id": "PROD001",
        "name": "Producto A",
        "price": 20000,
        "quantity": 30
      }
    ],
    "socioeconomicStratum": 2
  }'
```

**Resultado esperado:**
- Subtotal: $600,000
- Envío: $0 (envío gratuito por monto alto configurado en `FREE_SHIPPING_THRESHOLD`)
- Descuento: $60,000 (10% por volumen configurado en `VOLUME_DISCOUNT_2_PCT` - el más alto)
- **Total: $540,000**

## 🏗️ Arquitectura

### Estructura del Proyecto

```
src/
├── config/           # Configuración de la aplicación
├── controllers/      # Controladores HTTP
├── middleware/       # Middleware personalizado
├── routes/          # Definición de rutas
├── services/        # Lógica de negocio
├── types/           # Definiciones TypeScript
├── tests/           # Tests unitarios
└── index.ts         # Punto de entrada
```

### Patrones Implementados

- **Service Layer Pattern**: Separación de lógica de negocio
- **Controller Pattern**: Manejo de HTTP requests/responses
- **Middleware Pattern**: Validación y procesamiento de requests
- **Dependency Injection**: Servicios inyectados en controladores

## 🔧 Configuración Avanzada

### Variables de Entorno

La aplicación utiliza variables de entorno para toda su configuración. Copia el archivo `env.example` como `.env` y ajusta los valores según tu entorno:

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar configuración
nano .env
```

#### Variables Principales

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto del servidor | `3000` |
| `HOST` | Host del servidor | `localhost` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `CORS_ORIGIN` | Origen permitido para CORS | `*` |
| `RATE_LIMIT_MAX` | Máximo requests por ventana | `100` |
| `RATE_LIMIT_WINDOW_MS` | Ventana de tiempo (ms) | `900000` (15 min) |

#### Configuración de Envío

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `SHIPPING_BASE_COST` | Costo base del envío (COP) | `8000` |
| `FREE_SHIPPING_THRESHOLD` | Umbral para envío gratuito (COP) | `200000` |
| `STRATUM_1_MULTIPLIER` | Multiplicador estrato 1 | `0.5` |
| `STRATUM_2_MULTIPLIER` | Multiplicador estrato 2 | `0.7` |
| `STRATUM_3_MULTIPLIER` | Multiplicador estrato 3 | `0.8` |
| `STRATUM_4_MULTIPLIER` | Multiplicador estrato 4 | `1.0` |
| `STRATUM_5_MULTIPLIER` | Multiplicador estrato 5 | `1.2` |
| `STRATUM_6_MULTIPLIER` | Multiplicador estrato 6 | `1.5` |

#### Configuración de Descuentos

**Descuentos por Volumen:**
- `VOLUME_DISCOUNT_1_QTY=10` y `VOLUME_DISCOUNT_1_PCT=5`
- `VOLUME_DISCOUNT_2_QTY=25` y `VOLUME_DISCOUNT_2_PCT=10`
- `VOLUME_DISCOUNT_3_QTY=50` y `VOLUME_DISCOUNT_3_PCT=15`
- `VOLUME_DISCOUNT_4_QTY=100` y `VOLUME_DISCOUNT_4_PCT=20`

**Descuentos por Monto Total:**
- `AMOUNT_DISCOUNT_1_MIN=100000` y `AMOUNT_DISCOUNT_1_PCT=5`
- `AMOUNT_DISCOUNT_2_MIN=250000` y `AMOUNT_DISCOUNT_2_PCT=10`
- `AMOUNT_DISCOUNT_3_MIN=500000` y `AMOUNT_DISCOUNT_3_PCT=15`
- `AMOUNT_DISCOUNT_4_MIN=1000000` y `AMOUNT_DISCOUNT_4_PCT=20`

**Descuentos por Estrato:**
- `STRATUM_DISCOUNT_1=10` (Estrato 1: 10%)
- `STRATUM_DISCOUNT_2=8` (Estrato 2: 8%)
- `STRATUM_DISCOUNT_3=5` (Estrato 3: 5%)

#### Configuración de Seguridad

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `JWT_SECRET` | Secreto para JWT | `your-secret-key-change-in-production` |
| `JWT_EXPIRES_IN` | Tiempo de expiración JWT | `24h` |
| `BCRYPT_ROUNDS` | Rounds para bcrypt | `12` |
| `ENABLE_HELMET` | Habilitar Helmet | `true` |

### Rate Limiting

- **Ventana**: Configurable via `RATE_LIMIT_WINDOW_MS` (default: 15 minutos)
- **Límite**: Configurable via `RATE_LIMIT_MAX` (default: 100 requests por IP)
- **Headers**: Información de límites en respuesta

## 🚨 Manejo de Errores

### Códigos de Error HTTP

| Código | Descripción |
|--------|-------------|
| 400    | Bad Request - Datos inválidos |
| 404    | Not Found - Endpoint no encontrado |
| 429    | Too Many Requests - Rate limit excedido |
| 500    | Internal Server Error - Error del servidor |

### Formato de Error

```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🤝 Contribución

### Estándares de Código

- **TypeScript**: Tipado estricto habilitado
- **ESLint**: Configuración personalizada
- **Prettier**: Formateo automático
- **Jest**: Testing framework

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.

---

*Esta API demuestra las mejores prácticas en desarrollo de APIs RESTful, incluyendo validación robusta, manejo de errores, testing completo y documentación detallada.*
