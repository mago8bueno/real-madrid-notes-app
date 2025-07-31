# Real Madrid - Notas de Jugadores v4.1

Una aplicación web minimalista y profesional para registrar y analizar el rendimiento de los jugadores del Real Madrid después de cada partido.

## 🆕 Novedades en v4.1

### Errores Corregidos
- ✅ **Navegación funcional**: Los botones de navegación ahora cambian correctamente entre pestañas
- ✅ **Contadores de goles**: Los botones +/- actualizan el marcador correctamente
- ✅ **Fondo temático**: Añadida imagen de fondo del Santiago Bernabéu

### Mejoras de UX
- 🎨 **Animaciones sutiles**: Transiciones suaves en navegación y cambio de pestañas
- 🏟️ **Diseño temático**: Fondo del estadio Santiago Bernabéu con overlay elegante
- 🔧 **Estabilidad mejorada**: Mejor manejo de errores y validaciones

## Características Principales

### Diseño Minimalista y Profesional
- Interfaz ultra limpia con paleta de colores sobria
- Tipografía elegante con fuente Inter
- Animaciones sutiles y necesarias únicamente
- Diseño completamente responsive para móvil y escritorio

### Gestión Completa de Partidos
- **Formulario intuitivo** con datos del partido (rival, fecha, competición, ubicación, goles)
- **Subida de escudo del rival** mediante archivo local
- **Selector de formaciones** con 6 opciones: 4-3-3, 4-4-2, 3-5-2, 4-2-3-1, 3-4-3, 5-3-2
- **Campo de fútbol visual** para arrastrar y colocar jugadores en posiciones
- **Sistema de calificaciones** del 0 al 10 con comentarios opcionales

### Análisis de Jugadores
- **Modal de estadísticas** al hacer clic en cualquier jugador de la plantilla
- **Promedio de notas**, partidos jugados, mejor y peor nota
- **Historial completo** de partidos con notas y comentarios específicos
- **Gestión de plantilla** con opción de añadir y eliminar jugadores

### Estadísticas Avanzadas
- **4 tipos de análisis**: Jugador Individual, Estadísticas del Equipo, Comparar Jugadores, Por Competición
- **Gráficos de evolución** del rendimiento de jugadores
- **Rankings dinámicos** de mejores y peores jugadores
- **Análisis comparativo** entre cualquier par de jugadores
- **Métricas por competición** para análisis específico

### Historial y Seguimiento
- **Historial completo** de todos los partidos registrados
- **Eliminación de partidos** con confirmación de seguridad
- **Persistencia de datos** mediante localStorage
- **Exportación e importación** de datos (opcional con Firebase)

## Instalación y Uso

### Uso Local (Recomendado)
1. Descarga y descomprime el archivo ZIP
2. Abre el archivo `index.html` en tu navegador web
3. La aplicación funcionará inmediatamente sin necesidad de servidor

### Uso con Servidor Local
```bash
# Navegar al directorio de la aplicación
cd real-madrid-notes-app

# Iniciar servidor HTTP simple
python3 -m http.server 8080

# Abrir en el navegador
# http://localhost:8080
```

## Estructura del Proyecto

```
real-madrid-notes-app/
├── index.html              # Página principal
├── style.css               # Estilos minimalistas
├── app.js                  # Lógica de la aplicación
├── jugadores-data.js       # Datos de jugadores
├── firebase-config.js      # Configuración Firebase (opcional)
├── fotos_jugadores/        # Fotos de todos los jugadores
├── imagenes_frontend/      # Imágenes de ambientación
└── README.md              # Este archivo
```

## Configuración Opcional de Firebase

Para sincronizar datos entre dispositivos:

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Firestore Database
3. Actualizar `firebase-config.js` con tus credenciales
4. La aplicación detectará automáticamente Firebase y sincronizará datos

## Funcionalidades Destacadas

### Selector de Formaciones
- **6 formaciones tácticas** predefinidas
- **Posicionamiento visual** en campo de fútbol realista
- **Drag & drop** para colocar jugadores
- **Intercambio automático** de posiciones

### Modal de Estadísticas de Jugador
- **Acceso rápido** haciendo clic en cualquier jugador
- **Métricas completas** de rendimiento
- **Historial detallado** de todos los partidos
- **Diseño limpio** y fácil de leer

### Gestión de Plantilla
- **Añadir nuevos jugadores** con foto
- **Eliminar jugadores** que ya no estén en el equipo
- **Actualización automática** en todas las secciones
- **Validación de datos** para evitar duplicados

## Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Diseño minimalista con variables CSS
- **JavaScript ES6+** - Lógica de aplicación moderna
- **LocalStorage** - Persistencia de datos local
- **Firebase** - Sincronización en la nube (opcional)

## Compatibilidad

- **Navegadores**: Chrome, Firefox, Safari, Edge (versiones modernas)
- **Dispositivos**: Escritorio, tablet y móvil
- **Resoluciones**: Responsive desde 320px hasta 4K

## Mejoras en la Versión 4.0

### UX y Diseño
- Diseño ultra minimalista y profesional
- Reducción significativa de animaciones innecesarias
- Paleta de colores más sobria y elegante
- Tipografía mejorada para mejor legibilidad

### Funcionalidades Nuevas
- Modal de estadísticas de jugador al hacer clic en plantilla
- Selector de formaciones con 6 opciones tácticas
- Eliminación de partidos desde el historial
- Gestión completa de jugadores (añadir/eliminar)

### Correcciones Técnicas
- Rutas de imágenes corregidas
- Funciones duplicadas eliminadas
- Manejo de errores mejorado
- Optimización del rendimiento

### Simplificación
- Plantilla simplificada (solo nombre y foto)
- Formularios más intuitivos
- Navegación más fluida
- Código más limpio y mantenible

## Soporte

Para reportar problemas o sugerir mejoras, contacta al desarrollador.

## Licencia

Proyecto personal para uso privado.

---

**¡Hala Madrid!** ⚪👑

