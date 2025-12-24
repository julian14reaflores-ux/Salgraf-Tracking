# 📖 Guía de Configuración Paso a Paso

Esta guía te llevará desde cero hasta tener la aplicación funcionando en producción.

---

## 📑 Tabla de Contenidos

1. [Configuración de Google Sheets](#1-configuración-de-google-sheets)
2. [Configuración de Google Cloud Platform](#2-configuración-de-google-cloud-platform)
3. [Configuración del Proyecto Local](#3-configuración-del-proyecto-local)
4. [Subir Código a GitHub](#4-subir-código-a-github)
5. [Desplegar en Vercel](#5-desplegar-en-vercel)
6. [Configurar Cron Jobs](#6-configurar-cron-jobs)
7. [Verificación Final](#7-verificación-final)

---

## 1. Configuración de Google Sheets

### Paso 1.1: Crear la Hoja de Cálculo

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Nómbrala: **"LAAR Tracking"** (o el nombre que prefieras)
4. Crea una pestaña llamada **"Tracking"**

### Paso 1.2: Configurar las Columnas

En la fila 1 (encabezados), agrega estas columnas en orden:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| ID | Guía | Fecha Carga | Estado | Ciudad Origen | Ciudad Destino | Entregado A | Fecha Entrega | Última Actualización | Historial |

**Formato recomendado para encabezados:**
- Fondo: Negro (#000000)
- Texto: Blanco (#FFFFFF)
- Fuente: Negrita
- Alineación: Centro

### Paso 1.3: Obtener el ID de la Hoja

1. Abre tu hoja de Google Sheets
2. En la URL, verás algo como:
   ```
   https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit
   ```
3. Copia el ID (la parte entre `/d/` y `/edit`):
   ```
   1AbCdEfGhIjKlMnOpQrStUvWxYz
   ```
4. Guárdalo, lo necesitarás después

---

## 2. Configuración de Google Cloud Platform

### Paso 2.1: Crear Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en el selector de proyectos (parte superior)
3. Clic en **"Nuevo Proyecto"**
4. Nombre: **"LAAR Tracking"**
5. Clic en **"Crear"**

### Paso 2.2: Habilitar Google Sheets API

1. En el menú lateral, ve a **"APIs y servicios" > "Biblioteca"**
2. Busca: **"Google Sheets API"**
3. Clic en el resultado
4. Clic en **"Habilitar"**

### Paso 2.3: Crear Service Account

1. Ve a **"APIs y servicios" > "Credenciales"**
2. Clic en **"+ Crear credenciales"**
3. Selecciona **"Cuenta de servicio"**
4. Completa:
   - **Nombre**: `laar-tracking-service`
   - **ID**: Se genera automáticamente
   - **Descripción**: "Service account para LAAR Tracking"
5. Clic en **"Crear y continuar"**
6. En **"Rol"**, selecciona: **"Editor"**
7. Clic en **"Continuar"** y luego **"Listo"**

### Paso 2.4: Generar Clave JSON

1. En la lista de cuentas de servicio, encuentra la que creaste
2. Clic en los tres puntos (⋮) a la derecha
3. Selecciona **"Administrar claves"**
4. Clic en **"Agregar clave" > "Crear clave nueva"**
5. Selecciona formato **"JSON"**
6. Clic en **"Crear"**
7. Se descargará un archivo JSON - **¡GUÁRDALO EN LUGAR SEGURO!**
8. Renombra el archivo a: `google-credentials.json`

### Paso 2.5: Compartir Google Sheets con Service Account

1. Abre el archivo JSON descargado
2. Busca el campo `client_email`, se ve así:
   ```json
   "client_email": "laar-tracking-service@proyecto-123456.iam.gserviceaccount.com"
   ```
3. Copia ese email completo
4. Ve a tu hoja de Google Sheets
5. Clic en **"Compartir"** (esquina superior derecha)
6. Pega el email del service account
7. Dale permisos de **"Editor"**
8. Desmarca **"Notificar a las personas"**
9. Clic en **"Compartir"**

---

## 3. Configuración del Proyecto Local

### Paso 3.1: Instalar Node.js

Si no tienes Node.js instalado:

1. Ve a [nodejs.org](https://nodejs.org/)
2. Descarga la versión LTS (v18 o superior)
3. Instala siguiendo el asistente
4. Verifica la instalación:
   ```bash
   node --version
   npm --version
   ```

### Paso 3.2: Crear el Proyecto

1. Abre tu terminal o símbolo del sistema
2. Navega a donde quieres crear el proyecto:
   ```bash
   cd ~/Documentos
   ```
3. El código ya está organizado en carpetas (lo subiré a GitHub en el siguiente paso)

### Paso 3.3: Configurar Variables de Entorno

1. En la raíz del proyecto, crea un archivo llamado `.env.local`
2. Copia el contenido de `.env.example` y completa los valores:

```env
# Google Sheets Configuration
GOOGLE_SHEETS_SPREADSHEET_ID=1AbCdEfGhIjKlMnOpQrStUvWxYz
GOOGLE_SHEETS_TAB_NAME=Tracking

# Google Service Account Credentials (JSON completo en una línea)
GOOGLE_SERVICE_ACCOUNT_EMAIL=laar-tracking-service@proyecto-123456.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTuClavePrivadaAquí\n-----END PRIVATE KEY-----\n"

# Timezone (Ecuador)
TZ=America/Guayaquil

# Scraping Configuration
SCRAPING_DELAY_MS=2000
MAX_GUIAS_PER_BATCH=50
```

**Importante:** Para `GOOGLE_PRIVATE_KEY`:
1. Abre el archivo `google-credentials.json`
2. Copia el valor del campo `private_key` (incluye `-----BEGIN` y `-----END`)
3. Pégalo con comillas dobles
4. Mantén los `\n` tal cual están

### Paso 3.4: Instalar Dependencias

```bash
npm install
```

Esto instalará:
- next
- react
- react-dom
- googleapis
- puppeteer (para scraping)
- date-fns (manejo de fechas)

### Paso 3.5: Probar Localmente

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

**¿Funciona? ✅ Continúa al siguiente paso**
**¿No funciona? ⚠️ Revisa los errores en la consola**

---

## 4. Subir Código a GitHub

### Paso 4.1: Crear Repositorio en GitHub

1. Ve a [github.com](https://github.com)
2. Inicia sesión
3. Clic en el **"+"** (esquina superior derecha)
4. Selecciona **"New repository"**
5. Completa:
   - **Repository name**: `laar-tracking`
   - **Description**: "Sistema de tracking para guías LAAR Courier"
   - **Visibility**: Private (recomendado)
6. NO marques "Initialize with README" (ya tenemos uno)
7. Clic en **"Create repository"**

### Paso 4.2: Inicializar Git Local

En la terminal, dentro de la carpeta del proyecto:

```bash
# Inicializar repositorio
git init

# Agregar todos los archivos
git add .

# Primer commit
git commit -m "Initial commit: LAAR Tracking System"

# Conectar con GitHub (reemplaza TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/laar-tracking.git

# Cambiar a rama main
git branch -M main

# Subir código
git push -u origin main
```

**Nota:** GitHub te pedirá autenticación. Usa un Personal Access Token si tienes 2FA activado.

### Paso 4.3: Verificar Subida

1. Actualiza la página de tu repositorio en GitHub
2. Deberías ver todos los archivos del proyecto
3. Verifica que `.env.local` NO esté subido (debe estar en `.gitignore`)

---

## 5. Desplegar en Vercel

### Paso 5.1: Crear Cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Clic en **"Sign Up"**
3. Selecciona **"Continue with GitHub"**
4. Autoriza a Vercel a acceder a tu GitHub

### Paso 5.2: Importar Proyecto

1. En el dashboard de Vercel, clic en **"Add New"**
2. Selecciona **"Project"**
3. Busca `laar-tracking` en la lista de repositorios
4. Clic en **"Import"**

### Paso 5.3: Configurar Variables de Entorno

1. En la sección **"Environment Variables"**, agrega una por una:

| Name | Value |
|------|-------|
| `GOOGLE_SHEETS_SPREADSHEET_ID` | `1AbCdEfGhIjKlMnOpQrStUvWxYz` |
| `GOOGLE_SHEETS_TAB_NAME` | `Tracking` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `tu-email@proyecto.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----\n...` |
| `TZ` | `America/Guayaquil` |
| `SCRAPING_DELAY_MS` | `2000` |
| `MAX_GUIAS_PER_BATCH` | `50` |

**Importante:** Para todas las variables, selecciona los tres ambientes:
- ✅ Production
- ✅ Preview
- ✅ Development

### Paso 5.4: Configurar Build Settings

En **"Build & Development Settings"**:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (ya configurado)
- **Output Directory**: `.next` (ya configurado)
- **Install Command**: `npm install` (ya configurado)

### Paso 5.5: Desplegar

1. Clic en **"Deploy"**
2. Espera 2-3 minutos mientras se construye
3. Una vez completado, verás: **"Your project has been successfully deployed"**
4. Clic en **"Visit"** para ver tu aplicación en producción

### Paso 5.6: Obtener URL de Producción

Tu aplicación estará en una URL como:
```
https://laar-tracking.vercel.app
```

O puedes configurar un dominio personalizado en:
**Settings > Domains**

---

## 6. Configurar Cron Jobs

### Paso 6.1: Verificar vercel.json

El archivo `vercel.json` ya está configurado con los horarios:
```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 10 * * *"
    },
    {
      "path": "/api/cron",
      "schedule": "0 13 * * *"
    },
    {
      "path": "/api/cron",
      "schedule": "0 16 * * *"
    }
  ]
}
```

Esto ejecutará actualizaciones a las 10:00, 13:00 y 16:00 (hora de Ecuador).

### Paso 6.2: Habilitar Cron Jobs en Vercel

⚠️ **Importante:** Los Cron Jobs requieren un plan Pro de Vercel ($20/mes)

Si tienes plan Pro:
1. Ve a tu proyecto en Vercel
2. Ve a **Settings > Cron Jobs**
3. Los cron jobs se activarán automáticamente

Si NO tienes plan Pro:
- Las actualizaciones automáticas no funcionarán
- Solo podrás usar el botón de actualización manual
- Alternativa: Usar un servicio externo como [cron-job.org](https://cron-job.org) para llamar a tu API

---

## 7. Verificación Final

### ✅ Checklist de Verificación

- [ ] Google Sheets creado con columnas correctas
- [ ] Service Account creado y compartido con la hoja
- [ ] Variables de entorno configuradas en Vercel
- [ ] Aplicación desplegada correctamente
- [ ] Puedo cargar guías desde la interfaz
- [ ] Los datos se guardan en Google Sheets
- [ ] El botón de actualización manual funciona
- [ ] Los filtros funcionan correctamente
- [ ] El contador de estados se muestra correctamente

### 🧪 Pruebas Recomendadas

1. **Prueba de carga individual:**
   - Ingresa: `LC51960903`
   - Verifica que se muestre el estado
   - Revisa que aparezca en Google Sheets

2. **Prueba de carga masiva:**
   - Ingresa: `LC51960903, LC51960904, LC51960905`
   - Verifica que todas se carguen
   - Revisa el delay entre peticiones

3. **Prueba de actualización:**
   - Clic en el botón "Actualizar Estado"
   - Verifica que se actualice la información

4. **Prueba de filtros:**
   - Aplica filtro por estado
   - Aplica filtro por ciudad
   - Combina múltiples filtros

### 🐛 Solución de Problemas Comunes

#### Error: "Failed to fetch Google Sheets"
**Causa:** Credenciales incorrectas o permisos insuficientes
**Solución:**
1. Verifica que el service account email esté correcto
2. Confirma que la hoja esté compartida con el service account
3. Revisa que la private key no tenga espacios extra

#### Error: "Scraping failed"
**Causa:** Puppeteer no está configurado correctamente en Vercel
**Solución:**
1. Vercel ya incluye Chrome en el runtime
2. Verifica que la URL de LAAR Courier sea correcta
3. Revisa los logs en Vercel Dashboard

#### Cron Jobs no se ejecutan
**Causa:** Requiere plan Pro de Vercel
**Solución:**
1. Actualiza a plan Pro ($20/mes)
2. O usa un servicio externo de cron
3. O usa solo actualización manual

#### Límite de guías excedido
**Causa:** Intentaste cargar más de 50 guías
**Solución:**
1. Divide las guías en lotes de máximo 50
2. O modifica `MAX_GUIAS_PER_BATCH` en variables de entorno

---

## 📞 Soporte Adicional

Si encuentras problemas no cubiertos en esta guía:

1. Revisa los logs en Vercel Dashboard
2. Verifica las variables de entorno
3. Consulta la documentación de:
   - [Next.js](https://nextjs.org/docs)
   - [Google Sheets API](https://developers.google.com/sheets/api)
   - [Vercel](https://vercel.com/docs)

---

## 🎉 ¡Listo!

Tu sistema de tracking LAAR Courier está completamente configurado y funcionando en producción.

**URL de tu aplicación:** `https://tu-proyecto.vercel.app`

**Próximos pasos:**
- Comparte la URL con tu equipo
- Configura un dominio personalizado (opcional)
- Monitorea el uso y ajusta según sea necesario

---

**Última actualización:** Diciembre 2024
