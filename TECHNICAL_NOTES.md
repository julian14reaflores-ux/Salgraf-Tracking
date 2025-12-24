# Notas Técnicas y Consideraciones

## Arquitectura del Sistema

### Frontend (Next.js + React)
- **Framework**: Next.js 14 (React 18)
- **Estilo**: CSS vanilla con variables CSS
- **Componentes**: Organizados por funcionalidad
- **Estado**: React hooks (useState, useEffect, useCallback)

### Backend (Next.js API Routes)
- **Scraping**: Puppeteer + Chrome AWS Lambda
- **Base de datos**: Google Sheets API v4
- **Autenticación**: Service Account de Google Cloud
- **Cron Jobs**: Vercel Cron (requiere plan Pro)

## Consideraciones Técnicas

### 1. Web Scraping

**Puppeteer en Producción (Vercel)**
- Se usa `chrome-aws-lambda` para tener Chrome disponible en Vercel
- Configuración diferente entre desarrollo (local) y producción
- Timeout de 30 segundos para cargar páginas
- User agent configurado para evitar bloqueos

**Rate Limiting**
- Delay de 2 segundos entre peticiones (configurable)
- Límite de 50 guías por carga masiva (configurable)
- Previene saturar el servidor de LAAR Courier

**Selectores CSS**
- Múltiples selectores de respaldo por campo
- Búsqueda en tablas como plan B
- Parsing de texto plano como última opción
- ⚠️ Los selectores pueden necesitar ajustes según la estructura real del sitio

### 2. Google Sheets

**Autenticación**
- Service Account (no requiere OAuth)
- Clave privada almacenada en variables de entorno
- Formato específico: mantener `\n` en la clave

**Estructura de Datos**
- ID autogenerado: `GUIA-TIMESTAMP`
- Historial en formato JSON (últimos 3 estados)
- Fecha y hora en zona horaria de Ecuador (America/Guayaquil)

**Límites**
- Google Sheets API: 60 requests/minuto por usuario
- 500 requests/100 segundos por proyecto
- El sistema respeta estos límites con el delay configurado

### 3. Vercel

**Límites del Plan Free**
- Funciones: 10 segundos de timeout máximo
- Ancho de banda: 100 GB/mes
- Builds: 6000 minutos/mes
- ⚠️ Cron Jobs NO disponibles en plan Free

**Límites del Plan Pro ($20/mes)**
- Funciones: 60 segundos de timeout
- Ancho de banda: 1 TB/mes
- Cron Jobs: Disponibles
- Recomendado para producción

**Variables de Entorno**
- Configurar en: Project Settings > Environment Variables
- Seleccionar los 3 ambientes: Production, Preview, Development
- La private key debe incluir los `\n` literales

### 4. Cron Jobs

**Horarios Configurados**
- 10:00 AM (Ecuador)
- 1:00 PM (Ecuador)
- 4:00 PM (Ecuador)

**Formato Cron**
```
"0 10 * * *"  → 10:00 AM todos los días
"0 13 * * *"  → 1:00 PM todos los días
"0 16 * * *"  → 4:00 PM todos los días
```

**Alternativa Sin Plan Pro**
- Usar servicio externo: [cron-job.org](https://cron-job.org)
- Configurar llamadas HTTP GET a: `https://tu-app.vercel.app/api/cron`
- Agregar header de autorización si configuras `CRON_SECRET`

## Optimizaciones Implementadas

### Performance
1. **Scraping en lote**: Procesa múltiples guías en una sola sesión de navegador
2. **Filtros en cliente**: No requiere llamadas al servidor
3. **Estados finales**: No se actualizan guías ya entregadas
4. **Caché implícito**: Google Sheets como source of truth

### UX
1. **Feedback visual**: Loading states en todos los botones
2. **Alertas**: Notificación de guías recién entregadas
3. **Validación**: Formato de guías verificado antes de procesar
4. **Responsive**: Diseño adaptable a móviles

### Seguridad
1. **Variables de entorno**: Credenciales nunca expuestas al frontend
2. **Validación de entrada**: Límite de guías, formato correcto
3. **Rate limiting**: Previene abuso del scraping
4. **CORS**: APIs accesibles solo desde el dominio propio

## Mantenimiento

### Actualización de Selectores
Si el sitio de LAAR Courier cambia su estructura:

1. Abrir `src/lib/scraper.js`
2. Actualizar el array `SELECTORS` con los nuevos selectores
3. Probar localmente con `npm run dev`
4. Hacer commit y push a GitHub (auto-deploy en Vercel)

### Monitoreo
- Revisar logs en Vercel Dashboard
- Verificar ejecución de cron jobs en la sección "Cron Jobs"
- Revisar Google Sheets para confirmar actualizaciones
- Usar el botón de actualización manual para pruebas

### Backup
- Google Sheets mantiene historial automático (30 días)
- Descargar copia de la hoja regularmente
- Exportar a Excel desde Google Sheets

## Escalabilidad

### Límites Actuales
- 50 guías por carga masiva
- ~150 guías actualizables en cada cron job (con 2s de delay)
- 500 requests/100 segundos a Google Sheets

### Para Escalar
1. **Aumentar timeout**: Modificar `maxDuration` en config de API routes
2. **Dividir carga**: Implementar cola de procesamiento
3. **Caché**: Agregar Redis para estados recientes
4. **Base de datos real**: Migrar de Google Sheets a PostgreSQL/MongoDB

## Troubleshooting Común

### Error: "Failed to fetch Google Sheets"
- Verificar que `GOOGLE_SHEETS_SPREADSHEET_ID` sea correcto
- Confirmar que la hoja esté compartida con el service account
- Revisar que la clave privada esté correctamente formateada

### Error: "Scraping timeout"
- El sitio puede estar lento o caído
- Aumentar timeout en `src/pages/api/scrape.js`
- Verificar que la URL sea correcta

### Cron jobs no se ejecutan
- Confirmar que tienes plan Pro de Vercel
- Revisar logs en Vercel Dashboard > Cron Jobs
- Verificar zona horaria en `vercel.json`

### Guías no se actualizan
- Verificar que no estén en estado final
- Revisar logs del endpoint `/api/cron`
- Confirmar que los selectores CSS sean correctos

## Roadmap Futuro

### Mejoras Sugeridas
- [ ] Sistema de notificaciones por email/SMS
- [ ] Exportación a Excel/CSV
- [ ] Dashboard con gráficas de tendencias
- [ ] Búsqueda de guías por rango de fechas
- [ ] Historial completo (no solo últimos 3 estados)
- [ ] API pública para integración con otros sistemas
- [ ] Modo oscuro
- [ ] PWA (Progressive Web App)
- [ ] Filtros avanzados con múltiples condiciones
- [ ] Bulk actions (actualizar múltiples guías a la vez)

### Integraciones Posibles
- WhatsApp Business API para notificaciones
- Slack para alertas al equipo
- Power BI / Tableau para analytics
- ERP/CRM de la empresa

---

**Última actualización**: Diciembre 2024
**Versión**: 1.0.0
