import type {
    TonalCyclePattern
} from "./types"


export function createTonalCyclePattern(
    name: string,
    color: string,
    rootMidi = 60,
    cycleBeats = 8
): TonalCyclePattern {

    return {
        id:
            crypto.randomUUID(),

        type:
            "tonal-cycle",

        name,

        color,

        rootMidi,

        /*
            Mayor:
            C D E F G A B
        */
        scaleIntervals: [
            0,
            2,
            4,
            5,
            7,
            9,
            11
        ],

        /*
            1 = 12 posiciones
            2 = 24
            3 = 36
        */
        octaveSpan: 1,
            

        traversalMode:
            "divide",

        amount:
            4,

        rotation:
            0,

        cycleBeats,
        gate: 0.8, 
        
    }
}