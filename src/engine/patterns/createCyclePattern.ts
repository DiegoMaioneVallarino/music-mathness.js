import type {
    CyclePattern
} from "./types"


export function createCyclePattern(
    name: string,
    color: string,
    cycleBeats = 8
): CyclePattern {

    return {

        id:
            crypto.randomUUID(),

        type:
            "cycle",

        name,

        color,

        cycleBeats,

        layers: []
    }
}