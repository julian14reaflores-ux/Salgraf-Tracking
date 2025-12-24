# 🚚 Sistema de Tracking LAAR Courier

Sistema completo de seguimiento de guías con web scraping, almacenamiento en Google Sheets y despliegue en Vercel.

## 📋 Características

- ✅ Consulta automática de estados de guías (10:00, 13:00, 16:00)
- ✅ Actualización manual con botón
- ✅ Carga masiva de guías (separadas por comas)
- ✅ Almacenamiento en Google Sheets
- ✅ Dashboard con contadores por estado
- ✅ Filtros por fecha, ciudad origen, ciudad destino y estado
- ✅ Alertas de guías recién entregadas
- ✅ Historial de últimos 3 estados
- ✅ Diseño formal: negro, blanco y amarillo
- ✅ Límite: 50 guías por carga masiva

## 🏗️ Estructura del Proyecto

```
laar-tracking/
├── README.md                          # Este archivo
├── SETUP_GUIDE.md                     # Guía de configuración paso a paso
├── package.json                       # Dependencias del proyecto
├── .env.example                       # Variables de entorno de ejemplo
├── .gitignore                         # Archivos a ignorar en Git
├── vercel.json                        # Configuración de Vercel
├── public/
│   └── favicon.ico                    # Icono de la aplicación
├── src/
│   ├── pages/
│   │   ├── index.js                   # Página principal
│   │   └── api/
│   │       ├── scrape.js              # Endpoint de scraping
│   │       ├── sheets.js              # Operaciones con Google Sheets
│   │       ├── update-status.js       # Actualización de estados
│   │       └── cron.js                # Tareas programadas
│   ├── components/
│   │   ├── Dashboard.js               # Componente del dashboard
│   │   ├── GuiaTable.js               # Tabla de guías
│   │   ├── LoadGuias.js               # Formulario de carga
│   │   ├── Filters.js                 # Componente de filtros
│   │   └── Header.js                  # Encabezado con contadores
│   ├── lib/
│   │   ├── scraper.js                 # Lógica de web scraping
│   │   ├── sheets.js                  # Cliente de Google Sheets
│   │   └── utils.js                   # Funciones auxiliares
│   └── styles/
│       └── globals.css                # Estilos globales
└── config/
    └── google-credentials.json.example # Ejemplo de credenciales
```

## 🚀 Tecnologías

- **Frontend**: Next.js 14, React 18
- **Backend**: Next.js API Routes
- **Scraping**: Puppeteer
- **Base de Datos**: Google Sheets API v4
- **Despliegue**: Vercel
- **Control de Versiones**: GitHub

## 📦 Instalación Rápida

### Prerrequisitos
- Node.js 18+ instalado
- Cuenta de Google Cloud Platform
- Cuenta de GitHub
- Cuenta de Vercel

### Pasos Iniciales

1. **Clonar el repositorio** (después de subir a GitHub):
```bash
git clone https://github.com/TU_USUARIO/laar-tracking.git
cd laar-tracking
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar variables de entorno**:
```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales (ver SETUP_GUIDE.md)

4. **Ejecutar en desarrollo**:
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📚 Documentación Completa

Ver **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** para:
- ✅ Configuración de Google Sheets API
- ✅ Configuración de credenciales
- ✅ Subir código a GitHub
- ✅ Desplegar en Vercel
- ✅ Configurar cron jobs
- ✅ Solución de problemas comunes

## 🎨 Diseño

- **Colores principales**: 
  - Negro: `#000000`
  - Blanco: `#FFFFFF`
  - Amarillo: `#FFD700`
- **Fuente**: DM Sans (formal y moderna)
- **Estilo**: Profesional, limpio, con énfasis en datos

## ⚙️ Configuración de Google Sheets

### Estructura de la Hoja

La hoja debe tener estas columnas (en orden):

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| ID | Guía | Fecha Carga | Estado | Ciudad Origen | Ciudad Destino | Entregado A | Fecha Entrega | Última Actualización | Historial |

### Nombre de la Hoja
- Por defecto: `Tracking`
- Configurable en `.env.local`

## 🔄 Flujo de Trabajo

1. **Carga de guías**: Usuario ingresa números separados por comas
2. **Scraping inicial**: Se consulta el estado de cada guía
3. **Almacenamiento**: Datos se guardan en Google Sheets
4. **Actualización automática**: 3 veces al día (10:00, 13:00, 16:00)
5. **Actualización manual**: Botón para forzar actualización
6. **Alertas**: Notificación cuando guías llegan a "Entregado"

## 🛡️ Consideraciones de Seguridad

- Las credenciales de Google Sheets están en variables de entorno
- No se exponen en el frontend
- Rate limiting implementado (delay de 2 segundos entre requests)
- Validación de entrada para prevenir inyección

## 📊 Límites y Restricciones

- **Carga masiva**: Máximo 50 guías por vez
- **Rate limiting**: 2 segundos entre consultas de scraping
- **Historial**: Solo últimos 3 estados por guía
- **Actualizaciones automáticas**: Solo para guías no entregadas

## 🐛 Solución de Problemas

### Error de autenticación con Google Sheets
- Verificar que las credenciales estén correctas
- Confirmar que la API esté habilitada
- Revisar permisos del service account

### Scraping no funciona
- Verificar que Puppeteer esté instalado correctamente
- En Vercel, usar `@vercel/og` o desplegar con Chrome incluido
- Revisar que la URL de LAAR Courier no haya cambiado

### Cron jobs no se ejecutan
- Verificar configuración de Vercel Cron
- Revisar zona horaria en `vercel.json`
- Consultar logs en Vercel Dashboard

## 📝 Licencia

Proyecto privado para uso interno de LAAR Courier

## 👥 Contacto

Para soporte o preguntas sobre el sistema, contactar al equipo de desarrollo.

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2024
