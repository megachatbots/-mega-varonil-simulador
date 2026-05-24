// ─── Motor del torneo ─────────────────────────────────────────────────────────
const { JUGADORES_POR_GRUPO, nombreGrupo, PTS } = require('./datos')

function statsVacio() {
    return { pj: 0, pg: 0, pp: 0, sets_f: 0, sets_c: 0, juegos_f: 0, juegos_c: 0,
             pts: 0, walkovers: 0, defaults: 0, no_reportados: 0 }
}

// Inicializa el estado del torneo desde los datos maestros
function initTorneo() {
    const grupos = {}
    for (const [num, jugadores] of Object.entries(JUGADORES_POR_GRUPO)) {
        const n = parseInt(num)
        grupos[n] = {
            nombre: nombreGrupo(n),
            numero: n,
            jugadores: {}
        }
        for (const j of jugadores) {
            grupos[n].jugadores[j] = statsVacio()
        }
    }
    return {
        grupos,
        partidos: [],
        movimientos: [],  // log de ascensos/descensos
        mes: 1,
    }
}

// Parsear sets "6-4 7-5" → { sg, sp, jg, jp }
function parsearSets(sets_str) {
    let sg = 0, sp = 0, jg = 0, jp = 0
    const sets = sets_str.trim().split(/\s+/)
    for (const s of sets) {
        const [a, b] = s.replace('–', '-').split('-').map(Number)
        if (!isNaN(a) && !isNaN(b)) {
            a > b ? sg++ : sp++
            jg += a; jp += b
        }
    }
    return { sg, sp, jg, jp }
}

// Generar marcador aleatorio realista de tenis
function marcadorAleatorio() {
    const opciones = [
        "6-0 6-0", "6-1 6-0", "6-2 6-0", "6-3 6-1", "6-4 6-2",
        "6-3 6-3", "6-4 6-3", "6-4 6-4", "7-5 6-4", "7-6 6-4",
        "6-4 7-5", "7-5 7-5", "6-3 6-4 6-3", "6-4 3-6 6-3",
        "7-5 4-6 6-4", "6-2 4-6 7-5", "6-4 6-7 6-3",
        "7-6 4-6 7-6", "3-6 6-4 7-5", "4-6 6-3 6-4",
    ]
    return opciones[Math.floor(Math.random() * opciones.length)]
}

// Registrar un partido en el estado
function registrarPartido(estado, grupo_num, ganador, perdedor, tipo, sets_str) {
    const g = estado.grupos[grupo_num].jugadores

    if (tipo === 'jugado') {
        const { sg, sp, jg, jp } = parsearSets(sets_str)
        g[ganador].pj++;  g[ganador].pg++
        g[ganador].sets_f += sg; g[ganador].sets_c += sp
        g[ganador].juegos_f += jg; g[ganador].juegos_c += jp
        g[ganador].pts += PTS.VICTORIA
        g[perdedor].pj++; g[perdedor].pp++
        g[perdedor].sets_f += sp; g[perdedor].sets_c += sg
        g[perdedor].juegos_f += jp; g[perdedor].juegos_c += jg
        g[perdedor].pts += PTS.DERROTA
    } else if (tipo === 'walkover') {
        g[ganador].pg++; g[ganador].walkovers++
        g[ganador].pts += PTS.WO_GANADOR
        g[perdedor].pp++; g[perdedor].walkovers++
        g[perdedor].pts += PTS.WO_PERDEDOR
        sets_str = 'W.O.'
    } else if (tipo === 'default') {
        g[ganador].pg++; g[ganador].defaults++
        g[ganador].pts += PTS.DEF_GANADOR
        g[perdedor].pp++; g[perdedor].defaults++
        g[perdedor].pts += PTS.DEF_PERDEDOR
        sets_str = 'DEF'
    } else if (tipo === 'no_reportado') {
        g[ganador].no_reportados++
        g[perdedor].no_reportados++
        g[ganador].pts += PTS.NO_REPORTADO
        g[perdedor].pts += PTS.NO_REPORTADO
        sets_str = 'N/R'
    }

    estado.partidos.push({
        grupo_num,
        grupo_nombre: estado.grupos[grupo_num].nombre,
        jugador_a: ganador,
        jugador_b: perdedor,
        ganador: tipo === 'no_reportado' ? null : ganador,
        perdedor: tipo === 'no_reportado' ? null : perdedor,
        tipo,
        sets: sets_str,
    })
}

// Ordenar jugadores de un grupo con criterios de desempate
function tablaOrdenada(grupo) {
    const jugadores = Object.entries(grupo.jugadores)
    jugadores.sort((a, b) => {
        const sa = a[1], sb = b[1]
        if (sb.pts !== sa.pts) return sb.pts - sa.pts
        const dif_sets_a = sa.sets_f - sa.sets_c
        const dif_sets_b = sb.sets_f - sb.sets_c
        if (dif_sets_b !== dif_sets_a) return dif_sets_b - dif_sets_a
        return (sb.juegos_f - sb.juegos_c) - (sa.juegos_f - sa.juegos_c)
    })
    return jugadores
}

// Aplicar ascenso/descenso al final del mes
// Regla: pos 1,2 → suben (van al grupo anterior), pos 4,5 → bajan (van al grupo siguiente), pos 3 → se queda
function aplicarMovimientos(estado, config) {
    const { suben, bajan } = config  // suben=2, bajan=2
    const grupos_nums = Object.keys(estado.grupos).map(Number).sort((a,b) => a-b)
    const total_grupos = grupos_nums.length

    // Calcular qué jugadores suben y bajan de cada grupo
    const suben_map = {}   // grupo_num → [jugadores que suben]
    const bajan_map = {}   // grupo_num → [jugadores que bajan]

    for (const num of grupos_nums) {
        const tabla = tablaOrdenada(estado.grupos[num])
        const n = tabla.length
        suben_map[num] = tabla.slice(0, suben).map(j => j[0])
        bajan_map[num] = tabla.slice(n - bajan).map(j => j[0])
    }

    const movimientos = []

    // Aplicar intercambios: los que suben del grupo N van al grupo N-1
    // los que bajan del grupo N van al grupo N+1
    for (let i = 0; i < grupos_nums.length; i++) {
        const num = grupos_nums[i]
        const num_anterior = i > 0 ? grupos_nums[i-1] : null
        const num_siguiente = i < grupos_nums.length - 1 ? grupos_nums[i+1] : null

        // Los que suben del grupo num → van al grupo anterior
        if (num_anterior !== null) {
            for (const jugador of suben_map[num]) {
                movimientos.push({
                    jugador,
                    de: num,
                    a: num_anterior,
                    tipo: 'sube',
                    de_nombre: estado.grupos[num].nombre,
                    a_nombre: estado.grupos[num_anterior].nombre,
                })
            }
        }

        // Los que bajan del grupo num → van al grupo siguiente
        if (num_siguiente !== null) {
            for (const jugador of bajan_map[num]) {
                movimientos.push({
                    jugador,
                    de: num,
                    a: num_siguiente,
                    tipo: 'baja',
                    de_nombre: estado.grupos[num].nombre,
                    a_nombre: estado.grupos[num_siguiente].nombre,
                })
            }
        }
    }

    // Aplicar movimientos al nuevo estado
    // Primero remover todos los que se mueven de sus grupos actuales
    const nuevo_estado_grupos = {}
    for (const num of grupos_nums) {
        nuevo_estado_grupos[num] = {
            ...estado.grupos[num],
            jugadores: {}
        }
    }

    // Set de quién se mueve
    const se_mueve = new Set(movimientos.map(m => `${m.de}:${m.jugador}`))

    // Copiar los que se quedan
    for (const num of grupos_nums) {
        for (const [nombre, stats] of Object.entries(estado.grupos[num].jugadores)) {
            if (!se_mueve.has(`${num}:${nombre}`)) {
                nuevo_estado_grupos[num].jugadores[nombre] = statsVacio()
            }
        }
    }

    // Añadir los que se mueven a su nuevo grupo
    for (const mov of movimientos) {
        nuevo_estado_grupos[mov.a].jugadores[mov.jugador] = statsVacio()
    }

    // Actualizar estado
    for (const num of grupos_nums) {
        estado.grupos[num].jugadores = nuevo_estado_grupos[num].jugadores
    }

    estado.movimientos = movimientos
    return movimientos
}

module.exports = {
    initTorneo, statsVacio, registrarPartido,
    tablaOrdenada, aplicarMovimientos, marcadorAleatorio, parsearSets
}
