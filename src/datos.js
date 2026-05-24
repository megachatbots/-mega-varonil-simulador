// ─── MEGA VARONIL 2026 — Datos reales ────────────────────────────────────────

const NOMBRE_TORNEO = "MEGA VARONIL 2026"

const SEGMENTOS = {
    "Primera División": [1, 2, 3, 4, 5, 6, 7],
    "Liga de Ascenso":  [8, 9, 10, 11, 12, 13, 14],
    "Fuerzas Básicas":  [15, 16, 17, 18, 19, 20],
}

// Grupo 20 se llama "MB"
function nombreGrupo(n) {
    if (n === 20) return "MB"
    return `Grupo ${n}`
}

const JUGADORES_POR_GRUPO = {
    1:  ["Rocha", "Pico Ramos", "Ernesto Rdz", "Aran Carmona", "Watty"],
    2:  ["Claudio Serviere", "JM Suárez", "Daniel Aguilar", "Fermín", "Jordi Pous"],
    3:  ["Fer Fanghanel", "Alex Aguilera", "Rod Dlv", "Álvaro Padilla", "Ricardo Tinajero"],
    4:  ["Mau Ramírez", "Markus", "Mau Mora", "Josemi", "Jorge SM"],
    5:  ["JC Ramírez", "Felipe DV", "Diego Ortiz", "Ricardo Romero", "Guille de Piero"],
    6:  ["Cris Sánchez", "Manuel Bartlett", "Chema Arce", "Toño Abrazian", "David Yao"],
    7:  ["Guillermo Govela", "Isaac DC", "Andrés Marín", "Manuel DLR", "Víctor Morales"],
    8:  ["Ernesto Güereca", "Fer Gay", "Juan Morales", "Andrés Mtz", "Eric Arbaiza"],
    9:  ["Samuel Dolv", "Rafa Espino", "Ricky Tórres", "Carlos Díaz", "Rodrigo Medrano"],
    10: ["Benja Granados", "Alex Surman", "Renato Mtz", "Edgar Pérez", "Daniel Parra"],
    11: ["Javi Llamas", "Germán Quevedo", "Jorge Ávalos", "Nico Moreau", "Gus Rosas"],
    12: ["Ángel Mondragón", "Fernel Arvizu", "Juanjo", "Mau Pavón", "Valentín"],
    13: ["Fer Specia", "Andrés E. Mtz", "Pietro", "Sergio Sánchez", "Álvaro Cancino"],
    14: ["Claudio Gantous", "Roberto Ortiz", "Fer Glez", "Juan Lugo", "Braulio Delgado"],
    15: ["Pepo Bobadilla", "Agustín Quintanilla", "Juliano Chacón", "Luis Luna", "Rubén Salazar"],
    16: ["Rodolfo Amaro", "Sergio Gómez", "Víctor Osnaya", "Carlos Egido", "Raúl Fournier"],
    17: ["David Ramírez", "José Luis Oliva", "Antonio Puig", "Alexis Lavental", "JM Juárez"],
    18: ["Chava García de Q.", "Nico Ramírez", "MB", "Jerome Aymeric", "Francisco Pinilla"],
    19: ["Sergio Marquez", "Louis Steenbrink", "Miguel Huber", "Nico Gavaldon", "Frank"],
    20: ["Jules Cicurel", "Rafa Orozco", "Alejandro Escandon", "Fernando Magdaleno", "Juan Pablo Preisser"],
}

// Puntos
const PTS = {
    VICTORIA:  3,
    DERROTA:   1,
    WO_GANADOR: 3,
    WO_PERDEDOR: -1,
    DEF_GANADOR: 3,
    DEF_PERDEDOR: -1,
    NO_REPORTADO: -1,
}

module.exports = { NOMBRE_TORNEO, SEGMENTOS, JUGADORES_POR_GRUPO, nombreGrupo, PTS }
