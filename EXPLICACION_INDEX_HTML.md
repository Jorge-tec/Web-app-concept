# 🕹️ Documentación Técnica y Arquitectura de `index.html`

Bienvenido a la documentación de **[index.html](file:///d:/dev/nuevos%20proyetco%20para%20git/Nueva%20carpeta/index.html)**. Este documento detalla el propósito, los objetivos de diseño y la estructura técnica de la interfaz web del juego **Glitch Bot**.

---

## 🎯 Objetivo del Proyecto

El objetivo de `index.html` es proporcionar una experiencia de videojuego retro-cyberpunk móvil (**PWA / Web App**) de máxima fidelidad visual y rendimiento nativo sin requerir la instalación de librerías o frameworks pesados (como React, Angular o Tailwind).

### Principios de diseño implementados:
1. **Estética Cyber-Arcade Premium:** Uso de paletas de alto contraste (fondo oscuro profundo `#060b14`, acentos neón verde `#00f395`, cian `#00e5ff`, naranja `#ffaa00` y carmesí `#f43f5e`), fuentes futuristas (*Orbitron*, *Chakra Petch*, *Rajdhani*) y efectos de fósforo CRT.
2. **Arquitectura SPA (Single Page Application):** Las 4 pantallas principales coexisten en el mismo archivo DOM, intercambiándose de manera instantánea sin recargas de página.
3. **Cero Dependencias Externas:** Construido 100% en HTML5 semántico, CSS3 moderno y Vanilla JavaScript.
4. **Enfoque Mobile-First:** Diseñado en un contenedor adaptable que emula un smartphone de última generación en computadoras de escritorio y se expande fluidamente en dispositivos táctiles.

---

## 🏗️ Mapa y Estructura del Documento `index.html`

El archivo está organizado en capas modulares claramente delimitadas por comentarios:

```
index.html
├── <head> (Metadatos, Fuentes Google Fonts y enlace a style.css)
└── <body>
    └── .app-viewport (Fondo general y centrado)
        └── .mobile-container (Carcasa simulada de app móvil)
            ├── .cyber-scanlines (Filtro retro CRT superpuesto)
            ├── .game-header (Barra superior de estado y perfil)
            ├── .resources-bar (HUD de Chips, Gemas y Batería)
            │
            ├── #viewGame (VISTA 1: Juego y Tablero)
            ├── #viewLevels (VISTA 2: Matriz de 10 Niveles)
            ├── #viewShop (VISTA 3: Tienda Cuántica y Skins)
            ├── #viewSettings (VISTA 4: Ajustes de Sistema)
            │
            ├── .bottom-nav (Barra de navegación inferior fija)
            ├── #gameToast (Banner de notificaciones dinámicas)
            └── #winModal (Modal de nivel completado y portal)
```

---

## 🔍 Desglose Detallado de Componentes

### 1. Encabezado Global (`<header class="game-header">`)
- **Avatar Cyber Bot:** Ilustración vectorial SVG del personaje con animación de pulso.
- **Identidad del Juego:** Título `GLITCH BOT` e indicador dinámico de la vista activa.
- **HUD de Estado Vital:** Nivel del jugador (`LVL 04`) y medidor de corazones/batería.
- **Acceso a Perfil:** Botón rápido para consultar la ficha de piloto.

---

### 2. Barra de Recursos (`<section class="resources-bar">`)
Muestra el balance en tiempo real del jugador, accesible en todas las vistas:
- **Chips (Ⓢ):** Moneda de juego obtenida al completar niveles. Permite comprar consumibles y skins básicas. Incluye botón `+` de recarga rápida.
- **Gemas (💎):** Divisa premium para ítems legendarios y mejoras avanzadas.
- **Pila / Energía (5/5):** Sistema de energía para iniciar misiones, con punto pulsante de recarga automática.

---

### 3. Vista 1: Juego y Tablero (`<div id="viewGame">`)
Es la pantalla interactiva principal donde se ejecuta la lógica del laberinto:
- **Card de Misión:**
  - Título del sector actual (*Misión: Cripta Neón*).
  - Temporizador de cuenta regresiva (`#countdownTimer`) con alerta de tiempo crítico.
  - Indicadores de pasos realizados (`#stepsCounter`) y llaves recolectadas (`#keysCounter`).
- **Tablero del Laberinto (`#gameGrid`):**
  - Matriz de 6x6 celdas renderizada dinámicamente por JavaScript.
  - Soporta baldosas normales, muros electrificados, trampas de choque, llaves cuánticas y el portal de salida.
  - El avatar del jugador cambia de apariencia en tiempo real según la skin seleccionada.
- **Módulo de Habilidades / Boosters:**
  - **Escudo EMP:** Inmunidad contra descargas eléctricas.
  - **Sensor Cuántico:** Revela la ruta más corta hacia las llaves.
  - **Salto Turbo:** Salta muros electrificados en línea recta.
- **Panel de Control Táctil:**
  - **D-Pad Arcade:** Cruceta direccional ergonómica (Arriba, Abajo, Izquierda, Derecha).
  - **Botón Interactuar:** Ejecuta acciones contextuales (abrir puertas, hackear terminales).
  - **Botones de Asistencia:** Botón *Pista* y botón *Reiniciar* partida.

---

### 4. Vista 2: Selección de Niveles (`<div id="viewLevels">`)
Permite navegar por los diferentes mundos del juego:
- **Card de Sector Activo:** Barra de progreso general (28/45 estrellas conseguidas).
- **Selector de Sectores:** Tabs horizontales para alternar entre *Sector 01: Cripta Neón* y *Sector 02: Matriz Cuántica*.
- **Matriz de 10 Niveles:** Rejilla interactiva donde cada celda muestra su número, estado (completado con check verde, activo con pulso neón, bloqueado con candado o nivel de JEFE final) y estrellas obtenidas (★).
- **Ficha de Detalle de Misión:** Al hacer clic en cualquier nivel, actualiza dinámicamente el nombre de la fase, rango recomendado, objetivos secundarios (ej: "Sin recibir daño", "Límite de 30 pasos") y recompensas en chips/gemas.
- **Botón de Lanzamiento:** Botón `¡JUGAR NIVEL!` que descuenta energía y redirige al tablero.

---

### 5. Vista 3: Tienda Cuántica (`<div id="viewShop">`)
Centro de economía y personalización del juego:
- **Oferta Destacada (Hacker Pack):** Banner promocional con temporizador regresivo de expiración y descuento del -40%.
- **Navegación por Categorías:** Pestañas internas (*Poderes*, *Skins*, *Banco*) con scroll suave automatizado.
- **Potenciadores de Laberinto:** Cards de compra y mejora para Sensor Mk.II, Escudo EMP, Salto Turbo y Multiplicador de Llaves.
- **Personalización del Bot (Skins 2x2):**
  - *Glitch Clásico (Verde neón - Mk.I)*
  - *Cyber Cian (Holográfico)*
  - *Centinela Dark (Sigilo Carmesí)*
  - *Bot Áureo (Legendario con destello dorado)*
  - Al equipar una skin, el SVG del jugador en el laberinto se transforma de inmediato.
- **Banco y Terminal de Carga:** Reclamo de cofre diario gratuito cada 24 horas, opción de ver transmisiones holo para ganar chips y simulación de compras integradas.

---

### 6. Vista 4: Ajustes de Sistema (`<div id="viewSettings">`)
Panel de configuración técnica del emulador:
- **Perfil de Piloto:** ID único de usuario `#GB-9948-2829` (con copiado automático al portapapeles), nivel, barra de EXP y botón para renombrar al piloto.
- **Audio y Acústica:** Sliders independientes para Efectos FX y Música Chiptune, con switch de micropulsos hápticos.
- **Controles:** Selector de método de entrada (*D-Pad*, *Swipe*, *Joystick F-1*) y control deslizante de sensibilidad (Niveles 1 al 5).
- **Gráficos:** Selector de tasa de refresco (30 FPS vs 60 FPS Ultra), filtro físico CRT con líneas de escaneo y selector de densidad de partículas neón.
- **Nube y Respaldo:** Sincronización cuántica simulada, enlace con Google Play y canje de códigos promocionales (ej. `GLITCH2025`).
- **Mantenimiento:** Herramientas de reporte de bugs, créditos del motor y purga de memoria local.

---

### 7. Barra Inferior Fija (`<nav class="bottom-nav">`)
Menú de navegación persistente en la parte inferior con 4 pestañas:
1. **JUGAR:** Activa `#viewGame`.
2. **NIVELES:** Activa `#viewLevels`.
3. **TIENDA:** Activa `#viewShop`.
4. **AJUSTES:** Activa `#viewSettings`.

---

### 8. Elementos Flotantes y Modales
- **Toast de Retroalimentación (`#gameToast`):** Notificaciones flotantes no invasivas para confirmar compras, errores de movimiento, códigos canjeados o alertas de batería.
- **Modal de Victoria (`#winModal`):** Ventana de felicitaciones que se despliega al alcanzar el portal, mostrando estadísticas finales (pasos utilizados, tiempo cronometrado y puntaje global obtenido) junto al botón de avance.

---

## 🔗 Relación con los Demás Archivos

- **[style.css](file:///d:/dev/nuevos%20proyetco%20para%20git/Nueva%20carpeta/style.css):** Proporciona toda la estética visual, sombras neón (`drop-shadow`, `box-shadow`), efectos de vidrio (*glassmorphism* con `backdrop-filter`), animaciones CSS y diseño responsivo.
- **[app.js](file:///d:/dev/nuevos%20proyetco%20para%20git/Nueva%20carpeta/app.js):** Contiene el motor completo:
  - Clase `SoundFX`: Sintetizador de audio 8-bit mediante la Web Audio API nativa.
  - Clase `GlitchBotGame`: Estado del juego, algoritmo de movimiento en cuadrícula, colisiones, renderizado SVG de skins, manejo de recursos y enrutador SPA de pestañas.
