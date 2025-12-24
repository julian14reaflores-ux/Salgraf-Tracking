# 🚀 Guía de Inicio Rápido

## Para Empezar Inmediatamente

### 1️⃣ Prerrequisitos Necesarios

Antes de comenzar, asegúrate de tener:
- ✅ Node.js 18 o superior instalado
- ✅ Cuenta de Google (para Google Sheets)
- ✅ Cuenta de GitHub
- ✅ Cuenta de Vercel (gratis o Pro)

### 2️⃣ Configuración Básica (10 minutos)

```bash
# 1. Navegar a la carpeta del proyecto
cd laar-tracking

# 2. Instalar dependencias
npm install

# 3. Copiar archivo de ejemplo de variables de entorno
cp .env.example .env.local

# 4. Editar .env.local con tus credenciales
# (Ver instrucciones detalladas en SETUP_GUIDE.md)
```

### 3️⃣ Configurar Google Sheets (15 minutos)

1. Crear hoja en [Google Sheets](https://sheets.google.com)
2. Agregar columnas (ver estructura en README.md)
3. Ir a [Google Cloud Console](https://console.cloud.google.com)
4. Crear proyecto y habilitar Google Sheets API
5. Crear Service Account y descargar JSON
6. Compartir la hoja con el email del service account

**Detalles completos en:** `SETUP_GUIDE.md` (Sección 1 y 2)

### 4️⃣ Probar Localmente (2 minutos)

```bash
# Verificar configuración
node scripts/test-setup.js

# Si todo está OK, iniciar servidor de desarrollo
npm run dev

# Abrir en navegador: http://localhost:3000
```

### 5️⃣ Subir a GitHub (5 minutos)

```bash
# Inicializar repositorio
git init
git add .
git commit -m "Initial commit"

# Crear repositorio en GitHub y conectar
git remote add origin https://github.com/TU_USUARIO/laar-tracking.git
git push -u origin main
```

**Detalles completos en:** `SETUP_GUIDE.md` (Sección 4)

### 6️⃣ Desplegar en Vercel (5 minutos)

1. Ir a [vercel.com](https://vercel.com)
2. Clic en "New Project"
3. Importar desde GitHub
4. Configurar variables de entorno
5. Deploy!

**Detalles completos en:** `SETUP_GUIDE.md` (Sección 5)

---

## 📚 Documentación Completa

- **README.md** - Descripción general del proyecto
- **SETUP_GUIDE.md** - Guía paso a paso completa (⭐ EMPIEZA AQUÍ)
- **TECHNICAL_NOTES.md** - Notas técnicas y consideraciones
- **ESTRUCTURA_PROYECTO.txt** - Árbol de archivos del proyecto

---

## 🆘 Problemas Comunes

### ❌ Error: "Cannot find module"
**Solución:** Ejecuta `npm install`

### ❌ Error: "Failed to fetch Google Sheets"
**Solución:** Verifica credenciales en `.env.local` y que la hoja esté compartida

### ❌ Error en scraping
**Solución:** Revisa que la URL de LAAR Courier sea correcta y que esté accesible

### ❌ Cron jobs no funcionan en Vercel
**Solución:** Los cron jobs requieren plan Pro ($20/mes)

---

## 🎯 Flujo de Trabajo Recomendado

1. ✅ Leer `SETUP_GUIDE.md` completamente
2. ✅ Configurar Google Sheets
3. ✅ Probar localmente con `npm run dev`
4. ✅ Subir a GitHub
5. ✅ Desplegar en Vercel
6. ✅ Configurar cron jobs (si tienes plan Pro)
7. ✅ ¡Empezar a usar el sistema!

---

## 💡 Tips

- **Prueba primero localmente** antes de desplegar
- **Guarda tus credenciales** en un lugar seguro
- **Revisa los logs** en Vercel si algo no funciona
- **Consulta TECHNICAL_NOTES.md** para detalles de implementación

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa la sección de troubleshooting en `SETUP_GUIDE.md`
2. Revisa los logs en Vercel Dashboard
3. Verifica que todas las variables de entorno estén correctas

---

**¡Éxito con tu proyecto!** 🚀
