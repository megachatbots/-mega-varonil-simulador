const express = require('express')
const path = require('path')
const { simularMes } = require('./src/simulador')
const { tablaOrdenada, aplicarMovimientos } = require('./src/motor')
const { NOMBRE_TORNEO, SEGMENTOS, nombreGrupo } = require('./src/datos')

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// Estado global en memoria (se regenera con cada simulación)
let estadoActual = null
let configActual = { pct_jugado: 70, pct_walkover: 10, pct_default: 10, pct_no_reportado: 10, suben: 2, bajan: 2 }
let movimientosActuales = []
let estadoPostMovimiento = null  // estado después de aplicar ascensos/descensos

// ── API ───────────────────────────────────────────────────────────────────────

// GET /api/config — obtener config actual
app.get('/api/config', (req, res) => {
    res.json(configActual)
})

// POST /api/simular — correr simulación con config
app.post('/api/simular', (req, res) => {
    const config = { ...configActual, ...req.body }
    configActual = config

    estadoActual = simularMes(config)
    movimientosActuales = []
    estadoPostMovimiento = null

    res.json({ ok: true, mensaje: 'Simulación completada', stats: resumenSimulacion(estadoActual) })
})

// POST /api/movimientos — aplicar ascensos/descensos
app.post('/api/movimientos', (req, res) => {
    if (!estadoActual) return res.status(400).json({ error: 'Primero corre la simulación' })

    // Clonar estado para no modificar el original
    const clon = JSON.parse(JSON.stringify(estadoActual))
    movimientosActuales = aplicarMovimientos(clon, { suben: configActual.suben, bajan: configActual.bajan })
    estadoPostMovimiento = clon

    res.json({ ok: true, movimientos: movimientosActuales })
})

// GET /api/tabla — tabla de todos los grupos (o uno específico)
app.get('/api/tabla', (req, res) => {
    const fuente = estadoActual
    if (!fuente) return res.json({ grupos: [] })

    const { grupo } = req.query
    const grupos_data = []

    const nums = grupo
        ? [parseInt(grupo)]
        : Object.keys(fuente.grupos).map(Number).sort((a,b) => a-b)

    for (const num of nums) {
        const g = fuente.grupos[num]
        if (!g) continue
        const tabla = tablaOrdenada(g)
        grupos_data.push({
            numero: num,
            nombre: g.nombre,
            segmento: segmentoDeGrupo(num),
            tabla: tabla.map(([nombre, stats], i) => ({
                pos: i + 1,
                nombre,
                ...stats,
                dif_sets: stats.sets_f - stats.sets_c,
                dif_juegos: stats.juegos_f - stats.juegos_c,
                movimiento: movimientoDeJugador(nombre, num),
            }))
        })
    }

    res.json({ grupos: grupos_data, segmentos: SEGMENTOS })
})

// GET /api/tabla-post — tabla después de aplicar movimientos
app.get('/api/tabla-post', (req, res) => {
    if (!estadoPostMovimiento) return res.json({ grupos: [] })

    const grupos_data = []
    const nums = Object.keys(estadoPostMovimiento.grupos).map(Number).sort((a,b) => a-b)

    for (const num of nums) {
        const g = estadoPostMovimiento.grupos[num]
        const tabla = tablaOrdenada(g)
        grupos_data.push({
            numero: num,
            nombre: g.nombre,
            segmento: segmentoDeGrupo(num),
            jugadores: tabla.map(([nombre]) => nombre)
        })
    }

    res.json({ grupos: grupos_data })
})

// GET /api/partidos — lista de partidos simulados
app.get('/api/partidos', (req, res) => {
    if (!estadoActual) return res.json({ partidos: [] })
    const { grupo, tipo } = req.query
    let partidos = estadoActual.partidos
    if (grupo) partidos = partidos.filter(p => p.grupo_num === parseInt(grupo))
    if (tipo)  partidos = partidos.filter(p => p.tipo === tipo)
    res.json({ partidos, total: partidos.length })
})

// GET /api/movimientos — lista de movimientos calculados
app.get('/api/movimientos', (req, res) => {
    res.json({ movimientos: movimientosActuales })
})

// GET /api/ranking — ranking global de 1 a 100 (basado en posición en grupo)
app.get('/api/ranking', (req, res) => {
    if (!estadoActual) return res.json({ ranking: [] })

    const ranking = []
    const nums = Object.keys(estadoActual.grupos).map(Number).sort((a,b) => a-b)

    let rank = 1
    for (const num of nums) {
        const g = estadoActual.grupos[num]
        const tabla = tablaOrdenada(g)
        for (const [nombre, stats] of tabla) {
            ranking.push({
                rank,
                grupo_num: num,
                grupo_nombre: g.nombre,
                segmento: segmentoDeGrupo(num),
                nombre,
                pts: stats.pts,
                pj: stats.pj,
                pg: stats.pg,
                pp: stats.pp,
                movimiento: movimientoDeJugador(nombre, num),
            })
            rank++
        }
    }

    res.json({ ranking })
})

// GET /api/info — info del torneo
app.get('/api/info', (req, res) => {
    res.json({
        nombre: NOMBRE_TORNEO,
        segmentos: SEGMENTOS,
        grupos: Object.keys(SEGMENTOS).reduce((acc, seg) => {
            SEGMENTOS[seg].forEach(n => { acc[n] = nombreGrupo(n) })
            return acc
        }, {})
    })
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function segmentoDeGrupo(num) {
    for (const [seg, nums] of Object.entries(SEGMENTOS)) {
        if (nums.includes(num)) return seg
    }
    return 'Desconocido'
}

function movimientoDeJugador(nombre, grupo_num) {
    if (!movimientosActuales.length) return 'queda'
    const mov = movimientosActuales.find(m => m.jugador === nombre && m.de === grupo_num)
    if (!mov) return 'queda'
    return mov.tipo  // 'sube' o 'baja'
}

function resumenSimulacion(estado) {
    const partidos = estado.partidos
    return {
        total: partidos.length,
        jugados:       partidos.filter(p => p.tipo === 'jugado').length,
        walkovers:     partidos.filter(p => p.tipo === 'walkover').length,
        defaults:      partidos.filter(p => p.tipo === 'default').length,
        no_reportados: partidos.filter(p => p.tipo === 'no_reportado').length,
    }
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎾 Simulador MEGA VARONIL 2026 corriendo en puerto ${PORT}`)
})
