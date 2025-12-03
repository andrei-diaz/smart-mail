# SmartMail

Sistema de Gestion de Paqueteria para la Universidad de Montemorelos.

## Descripcion

SmartMail es una aplicacion web disenada para digitalizar y optimizar la gestion de paquetes en el correo universitario. Reemplaza el sistema manual basado en libretas fisicas con una solucion digital que permite:

- Registro rapido de paquetes con captura de fotos
- Validacion de destinatarios contra una base de datos de usuarios autorizados
- Busqueda eficiente por nombre, guia, ubicacion o paqueteria
- Sistema de "archivo muerto" para paquetes no reclamados (+30 dias)
- Firma digital para confirmacion de entregas
- Estadisticas y analisis de rendimiento

## Inicio Rapido

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para produccion
npm run build

# Vista previa de produccion
npm run preview
```

## Arquitectura y Flujo de la Aplicacion

### Stack Tecnologico

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 7
- **Estilos**: TailwindCSS 3.4
- **UI Components**: Radix UI (Dialog, Dropdown, Select, Tabs)
- **Graficas**: Recharts
- **Iconos**: Lucide React
- **Firma Digital**: react-signature-canvas
- **Routing**: React Router DOM v7
- **Almacenamiento**: LocalStorage (para demo/prototipo)

### Estructura de Carpetas

```
src/
|-- App.tsx                  # Router principal y layout con sidebar
|-- main.tsx                 # Entry point
|-- pages/
|   |-- Home.tsx             # Dashboard con resumen general
|   |-- RegisterPackage.tsx  # Formulario de registro de paquetes
|   |-- SearchPackage.tsx    # Busqueda y entrega de paquetes
|   |-- Statistics.tsx       # Graficas y KPIs
|-- components/
|   |-- CarrierLogo.tsx      # Logos dinamicos de paqueterias
|   |-- SignatureModal.tsx   # Modal para firma digital
|   |-- QuarantineInfo.tsx   # Info de paquetes en cuarentena
|   |-- ReturnPackageModal.tsx # Modal para automatizar devoluciones
|   |-- ui/                  # Componentes base (shadcn/ui)
|-- data/
|   |-- users.ts             # Mock de usuarios autorizados
|-- lib/
    |-- utils.ts             # Utilidades (cn, etc.)
```

## Paginas y Funcionalidades

### 1. Dashboard (`/`)
**Archivo**: `src/pages/Home.tsx`

Vista general del sistema que muestra:
- **Tarjetas KPI**: Paquetes pendientes, entregados y en archivo muerto
- **Actividad Reciente**: Lista de los ultimos 8 paquetes con estado, paqueteria y fecha
- **Indicadores visuales**: Colores por estado (amarillo=pendiente, verde=entregado, rojo=archivo muerto)

### 2. Registrar Paquete (`/register`)
**Archivo**: `src/pages/RegisterPackage.tsx`

Formulario completo para ingreso de paquetes:

**Campos**:
- Paqueteria (Amazon, Mercado Libre, DHL, J&T, Estafeta, UPS, FedEx, Correos de Mexico)
- Numero de guia
- Destinatario (con autocompletado y validacion)
- Tipo (Caja, Sobre, Paquete, Bolsa)
- Tamano (Chico, Mediano, Grande)
- Ubicacion (sistema inteligente que filtra por paqueteria y tamano)
- Estante (Rack 1-5)
- Etiqueta de color (12 opciones)
- Foto de referencia (opcional, usando camara del dispositivo)

**Logica especial**:
- **Validacion de destinatarios**: Busca en la base de datos de usuarios. Si no existe, marca como "cuarentena" con etiqueta roja automatica.
- **Ubicacion inteligente**: Filtra ubicaciones disponibles segun paqueteria y tamano seleccionados.

### 3. Buscar Paquete (`/search`)
**Archivo**: `src/pages/SearchPackage.tsx`

Sistema de busqueda y entrega:

**Funcionalidades**:
- Busqueda por nombre, guia, paqueteria o ubicacion
- Filtros por estado: Todos, Pendientes, Entregados, Archivo Muerto
- Panel de detalles con informacion completa del paquete
- **Firma digital**: Modal para capturar firma del receptor al entregar
- **Devolucion automatizada**: Para paquetes en cuarentena o archivo muerto, genera correo de devolucion

**Estados de paquete**:
- `Not-Delivered`: Pendiente de entrega
- `Delivered`: Entregado (con firma y fecha)
- `Dead`: Archivo muerto (+30 dias sin reclamar)

### 4. Estadisticas (`/statistics`)
**Archivo**: `src/pages/Statistics.tsx`

Analisis visual del rendimiento:

**KPIs**:
- Tiempo promedio de recoleccion
- Dia mas concurrido
- Paquetes activos

**Graficas**:
- **Tendencia Mensual**: Area chart con volumen de paquetes recibidos vs entregados
- **Horas Pico**: Bar chart mostrando distribucion horaria de recepcion
- **Distribucion por Tamano**: Donut chart con porcentajes

**Filtros**:
- Rango de fechas: 7 dias, 30 dias, ano, todos
- Por paqueteria especifica

## Componentes Principales

### CarrierLogo
Muestra logos de paqueterias usando la API de Clearbit. Fallback a icono generico si no hay logo disponible.

### SignatureModal
Modal con canvas para captura de firma digital usando `react-signature-canvas`. Incluye opciones de limpiar y confirmar.

### QuarantineInfo
Panel informativo para paquetes no autorizados. Muestra direccion, contacto y horarios del departamento de correos.

### ReturnPackageModal
Genera automaticamente un correo de devolucion con template pre-llenado incluyendo datos del paquete y razon de devolucion.

## Flujo de Datos

```
+------------------+
|  Llega paquete   |
+--------+---------+
         |
         v
+------------------+     +-------------------+
| RegisterPackage  +---->| Validar usuario   |
|   (Formulario)   |     +--------+----------+
+------------------+              |
                         +--------+--------+
                         |                 |
                    Existe            No existe
                         |                 |
                         v                 v
                 Estado: Normal    Estado: Cuarentena
                 Color: Libre      Color: Rojo (forzado)
                         |                 |
                         +--------+--------+
                                  |
                                  v
                     +---------------------+
                     |    LocalStorage     |
                     |   packages: [...]   |
                     +----------+----------+
                                |
         +----------------------+----------------------+
         |                      |                      |
         v                      v                      v
+--------------+      +-----------------+    +--------------+
|  Dashboard   |      | SearchPackage   |    |  Statistics  |
|   (Home)     |      | (Busqueda)      |    |  (Graficas)  |
+--------------+      +--------+--------+    +--------------+
                               |
                     +---------+---------+
                     |                   |
               Marcar entrega      +30 dias sin
               (con firma)         reclamar
                     |                   |
                     v                   v
              Status: Delivered   Status: Dead
              + signature         (Archivo muerto)
              + deliveryDate
```

## Modelo de Datos

### Package (Paquete)
```typescript
interface PackageData {
  carrier: string;          // Paqueteria
  trackingNumber: string;   // Numero de guia
  recipient: string;        // Nombre del destinatario
  packageCategory: string;  // Tipo: Caja, Sobre, etc.
  packageSize: string;      // Tamano: Chico, Mediano, Grande
  location: string;         // Ubicacion en estanteria (A1-E4)
  rackNumber: string;       // Numero de estante (1-5)
  colorLabel: string;       // Etiqueta de color
  registeredBy: string;     // Quien registro el paquete
  registeredDate: string;   // Fecha ISO de registro
  deliveryDate: string;     // Fecha ISO de entrega
  status: 'Delivered' | 'Not-Delivered' | 'Dead';
  signature?: string;       // Base64 de firma (si entregado)
}
```

### User (Usuario autorizado)
```typescript
interface User {
  id: string;
  name: string;
  role: 'Student' | 'Employee' | 'Resident';
}
```

## Temas

La aplicacion soporta **modo claro y oscuro**. El toggle esta en el footer del sidebar. La preferencia se guarda en `localStorage` bajo la key `theme`.

## Scripts Disponibles

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo en `localhost:5173` |
| `npm run build` | Compila TypeScript y genera bundle de produccion |
| `npm run lint` | Ejecuta ESLint para verificar codigo |
| `npm run preview` | Sirve el build de produccion localmente |

## Notas de Desarrollo

- Los datos se persisten en `localStorage` bajo la key `packages`
- Los logos de paqueterias se obtienen de `logo.clearbit.com`
- El sistema detecta automaticamente paquetes con +30 dias y los marca como "Dead"
- La ubicacion sugerida cambia dinamicamente segun paqueteria y tamano seleccionados

## Contexto del Proyecto

Este sistema fue desarrollado para resolver los problemas del correo de la Universidad de Montemorelos:
- Reemplazar el registro manual en libreta
- Reducir tiempo de busqueda de paquetes (~5 min a segundos)
- Identificar usuarios no autorizados (ex-alumnos)
- Generar datos para justificar decisiones operativas
- Implementar politicas de archivo muerto automatizadas

---

**Version**: 1.0.0  
**Licencia**: Privado
