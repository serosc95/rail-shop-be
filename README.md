
# Proyecto NestJS - Tienda con Pago

[![NestJS](https://img.shields.io/badge/nestjs-10.x-red)](https://nestjs.com/)

Este proyecto es una aplicación permite la venta de productos y la realización de pagos mediante tarjeta de crédito utilizando una pasarela de pagos.

---

## 🚀 Tecnologías Utilizadas

- NestJS
- TypeScript
- Swagger
- PostgreSQL

---

## ⚙️ Funcionalidades

- Listado de productos disponibles.
- Realización de pagos mediante tarjeta de crédito.
- Actualización automática de stock tras una compra exitosa.
- Documentación interactiva mediante Swagger.
- Arquitectura modular y limpia con principios DDD (Domain-Driven Design).

---

## 📁 Estructura del proyecto

```bash
src/
├── App.tsx
├── main.tsx
├── components/              # Componentes de UI
├── store/                   # Gestión de estado global
├── styles/                  # Archivos CSS globales y personalizados
├── utils/                   # Validaciones y utilidades
└── hooks/                   # Hooks personalizados
 ```

---

## 📦 Endpoints

### 1. Obtener Productos

**GET** `/api/products`

**Descripción:** Devuelve el listado de productos disponibles.

**Respuesta de ejemplo:**

```json
[
  {
    "id": "62662509-7f29-4150-92f3-2cb182b095ba",
    "name": "Gorra",
    "description": "Color rojo",
    "price": "200000",
    "stock": 15
  },
  {
    "id": "7574d94b-632d-4ea0-98a0-c6c91fa1812b",
    "name": "Zapatos",
    "description": "Talla 42",
    "price": "8000000",
    "stock": 5
  },
  {
    "id": "146b6e2b-09b1-440a-863d-bb7c6378f6c8",
    "name": "Camiseta",
    "description": "Talla M",
    "price": "5000000",
    "stock": 8
  }
]
```

---

### 2. Realizar Pago

**POST** `/api/payment`

**Descripción:** Procesa el pago de un producto mediante tarjeta de crédito.

**Body de ejemplo:**

```json
{
  "productId": "146b6e2b-09b1-440a-863d-bb7c6378f6c8",
  "cantidad": 2,
  "cuotas": 5,
  "customerEmail": "cliente@email.com",
  "cardData": {
    "cardNumber": "4242424242424242",
    "cvc": "123",
    "expMonth": "08",
    "expYear": "28",
    "cardHolder": "José Pérez"
  }
}
```

**Respuesta de ejemplo:**

```json
{
  "message": "Pago recibido correctamente"
}
```

---

### 3. Documentación Swagger

**GET** `/api/docs`

**Descripción:** Acceso a la documentación interactiva del API.

---

## 🧪 Requisitos

- Node.js >= 18
- NestJS CLI
- Cuenta de pruebas en Wompi

---

## 🔧 Instalación y Ejecución

1. Clonar repositorio

```bash
git clone https://github.com/serosc95/rail-shop-be.git
cd rail-shop-be
```

2. Levantar el proyecto

```bash
# Instalar dependencias
npm install

# Ejecutar el servidor en desarrollo
npm run start:dev

# Acceder a la API en: http://localhost:3000
# Documentación Swagger: http://localhost:3000/api/docs
```
