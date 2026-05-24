// ─── Simulador de mes completo ────────────────────────────────────────────────
const { initTorneo, registrarPartido, marcadorAleatorio } = require('./motor')

// Genera todos los pares posibles de un array
function pares(arr) {
    const result = []
    for (let i = 0; i < arr.length; i++)
        for (let j = i + 1; j < arr.length; j++)
            result.push([arr[i], arr[j]])
    return result
}

function rand() { return Math.random() }

// Simula un mes completo
// config: { pct_jugado, pct_walkover, pct_default, pct_no_reportado }
function simularMes(config = {}) {
    const {
        pct_jugado      = 70,
        pct_walkover    = 10,
        pct_default     = 10,
        pct_no_reportado = 10,
    } = config

    const estado = initTorneo()

    // Normalizar porcentajes
    const total = pct_jugado + pct_walkover + pct_default + pct_no_reportado
    const p_jug = pct_jugado / total
    const p_wo  = (pct_jugado + pct_walkover) / total
    const p_def = (pct_jugado + pct_walkover + pct_default) / total

    for (const [num_str, grupo] of Object.entries(estado.grupos)) {
        const num = parseInt(num_str)
        const jugadores = Object.keys(grupo.jugadores)
        const partidos = pares(jugadores)

        for (const [jA, jB] of partidos) {
            const r = rand()
            let tipo, ganador, perdedor, sets

            if (r < p_jug) {
                tipo = 'jugado'
                sets = marcadorAleatorio()
                // Quien gana es aleatorio
                if (rand() < 0.5) { ganador = jA; perdedor = jB }
                else               { ganador = jB; perdedor = jA }
            } else if (r < p_wo) {
                tipo = 'walkover'
                if (rand() < 0.5) { ganador = jA; perdedor = jB }
                else               { ganador = jB; perdedor = jA }
                sets = 'W.O.'
            } else if (r < p_def) {
                tipo = 'default'
                if (rand() < 0.5) { ganador = jA; perdedor = jB }
                else               { ganador = jB; perdedor = jA }
                sets = 'DEF'
            } else {
                tipo = 'no_reportado'
                ganador = jA; perdedor = jB  // no importa el orden
                sets = 'N/R'
            }

            registrarPartido(estado, num, ganador, perdedor, tipo, sets)
        }
    }

    return estado
}

module.exports = { simularMes, pares }
