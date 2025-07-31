# Estructura de Datos en Firestore

## Colecciones y Documentos

### 1. Colección: `jugadores`
Almacena la información básica de cada jugador de la plantilla.

```json
{
  "id": "auto-generado-por-firestore",
  "nombre": "Vinícius Júnior",
  "foto": "ViniciusJunior.PNG",
  "posicion": "Extremo izquierdo",
  "activo": true
}
```

### 2. Colección: `competiciones`
Almacena las competiciones disponibles (LaLiga, Champions, etc.).

```json
{
  "id": "auto-generado-por-firestore",
  "nombre": "LaLiga",
  "activa": true
}
```

### 3. Colección: `partidos`
Almacena la información de cada partido creado.

```json
{
  "id": "auto-generado-por-firestore",
  "rival": "FC Barcelona",
  "fecha": "2024-10-26",
  "golesRealMadrid": 2,
  "golesRival": 1,
  "competicion": "LaLiga",
  "esLocal": true,
  "escudoRival": "https://url-del-escudo.com/barca.png",
  "titulares": [
    {
      "jugadorId": "id-del-jugador",
      "posicionCampo": { "x": 50, "y": 80 }
    }
  ],
  "suplentesQueJugaron": ["id-jugador-1", "id-jugador-2"],
  "notaPromedioEquipo": 7.2,
  "fechaCreacion": "timestamp"
}
```

### 4. Colección: `calificaciones`
Almacena las notas individuales de cada jugador por partido.

```json
{
  "id": "auto-generado-por-firestore",
  "partidoId": "id-del-partido",
  "jugadorId": "id-del-jugador",
  "nota": 8.5,
  "comentario": "Excelente partido, muy activo en ataque",
  "esTitular": true,
  "minutosJugados": 90
}
```

## Consultas Principales

### Para mostrar el historial de partidos:
```javascript
const partidosQuery = query(
  collection(db, 'partidos'), 
  orderBy('fecha', 'desc')
);
```

### Para obtener las calificaciones de un partido específico:
```javascript
const calificacionesQuery = query(
  collection(db, 'calificaciones'),
  where('partidoId', '==', partidoId)
);
```

### Para calcular estadísticas de un jugador:
```javascript
const estadisticasQuery = query(
  collection(db, 'calificaciones'),
  where('jugadorId', '==', jugadorId)
);
```

## Índices Recomendados en Firestore

1. `calificaciones`: Índice compuesto en `partidoId` y `jugadorId`
2. `partidos`: Índice simple en `fecha` (descendente)
3. `calificaciones`: Índice simple en `jugadorId`

