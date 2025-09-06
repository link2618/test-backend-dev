# Backend Developer Senior - Soluciones Completas

Este repositorio contiene las soluciones completas para la prueba de Backend Developer Senior, implementando estructuras de datos eficientes y arquitecturas de sistemas distribuidos.

## 📋 Índice de Soluciones

### 1.1 - Sistema de Ranking de Clientes
**Archivo:** `Scripts/ranking_customers.ts`
- **Problema:** Implementar un sistema de ranking de clientes basado en puntos
- **Solución:** Estructura de datos híbrida con Map + Array ordenado

### 1.2 - Gestión de Rutas de Transporte Público
**Archivo:** `Scripts/transport_route_management.ts`  
**Explicación:** `Scripts/explanation_item_1.2.md`
- **Problema:** Sistema eficiente para gestionar rutas de transporte público
- **Solución:** Tres estructuras de datos trabajando juntas:
  - `Map<string, Route>` - Almacenamiento principal de rutas
  - `Map<string, Set<string>>` - Índice inverso para consultas rápidas
  - `Map<string, Stop>` - Catálogo de paradas
- **Complejidad:** O(1) para la mayoría de operaciones, O(k) para consultas por parada

### 2 - Arquitectura de Sistema Distribuido
**Archivo:** `Scripts/Item_2_data_structures.md`
- **Problema:** Migración de monolito a microservicios para plataforma de delivery
- **Solución:** Arquitectura orientada a eventos con microservicios especializados
- **Tecnologías:** Docker, Kubernetes, Redis, PostgreSQL, Apache Kafka

### 3 - API REST Completa
**Directorio:** `Api/`
- **Implementación:** API REST con todas las funcionalidades del sistema
- **Tecnologías:** Node.js, Express, TypeScript
- **Características:** Validación, middleware, documentación automática


## 🚀 Cómo Ejecutar

### Prerequisitos
- Node.js 18+ o Deno 1.30+
- Git

### Instalación Rápida
```bash
# Clonar el repositorio
git clone <repository-url>
cd jikkosoft

# Ejecutar ejercicios de estructuras de datos
cd Scripts
deno task 1.1
deno task 1.2

# Levantar API (desde directorio Api/)
npm install
npm start
```


## 🎨 Patrones de Diseño Implementados

### Estructuras de Datos
- **Hybrid Data Structures** - Combinando Map + Array para optimizar diferentes operaciones
- **Reverse Index** - Pre-cálculo de relaciones para consultas rápidas
- **Lazy Loading** - Carga de datos bajo demanda

### Arquitectura
- **Event Sourcing** - Para auditoría y recuperación de estado
- **CQRS** - Separación de comandos y consultas
- **Circuit Breaker** - Para resiliencia en servicios externos
- **Saga Pattern** - Para transacciones distribuidas

## 🔧 Tecnologías Utilizadas

### Backend
- **TypeScript** - Tipado estático para mayor robustez
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web minimalista
- **Deno** - Runtime moderno para scripts

### Infraestructura
- **Docker** - Containerización
- **Kubernetes** - Orquestación de contenedores
- **Redis** - Caché y sesiones
- **PostgreSQL** - Base de datos relacional
- **Apache Kafka** - Message broker para eventos

### Herramientas de Desarrollo
- **ESLint** - Linting de código
- **Prettier** - Formateo automático
- **Jest** - Testing framework


## 🤝 Contribuciones

Este proyecto demuestra las mejores prácticas en:
- **Diseño de estructuras de datos** eficientes
- **Arquitectura de sistemas** escalables
- **Documentación técnica** clara y completa
- **Código limpio** y mantenible

---

*Desarrollado como parte del proceso de evaluación para Backend Developer Senior - Demostrando expertise en estructuras de datos, arquitectura de sistemas y desarrollo de APIs robustas.*
