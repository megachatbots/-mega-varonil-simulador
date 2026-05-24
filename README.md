# 🎾 MEGA VARONIL 2026 — Simulador

Simulador offline para probar el algoritmo de ascenso/descenso antes de conectarlo a WhatsApp.

## Deploy en Railway

1. Sube este repositorio a GitHub
2. En Railway → New Project → Deploy from GitHub → selecciona este repo
3. Railway detecta automáticamente Node.js y corre `npm start`
4. Accede a la URL que te da Railway

## Desarrollo local

```bash
npm install
npm start
# Abre http://localhost:3001
```

## Estructura

```
├── server.js          ← Servidor Express + API REST
├── src/
│   ├── datos.js       ← Jugadores reales + configuración del torneo
│   ├── motor.js       ← Algoritmo: puntos, tabla, ascenso/descenso
│   └── simulador.js   ← Generador de partidos aleatorios
└── public/
    └── index.html     ← Interfaz web completa
```

## API endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `POST /api/simular` | POST | Correr simulación con config |
| `POST /api/movimientos` | POST | Aplicar ascenso/descenso |
| `GET /api/tabla` | GET | Tabla de posiciones |
| `GET /api/tabla-post` | GET | Grupos del próximo mes |
| `GET /api/partidos` | GET | Lista de partidos simulados |
| `GET /api/movimientos` | GET | Lista de movimientos |
| `GET /api/ranking` | GET | Ranking global 1-100 |

## Cuando estés listo para WhatsApp

Este proyecto está diseñado para crecer. Los archivos `src/motor.js` y `src/datos.js` son el núcleo limpio del algoritmo — cuando estés satisfecho con la prueba, se integran directamente al bot de WhatsApp añadiendo:
- `src/baileys.js` — conexión WhatsApp
- `src/parseo.js` — interpretar mensajes en lenguaje natural
- `src/backup.js` — envío de backups al admin
