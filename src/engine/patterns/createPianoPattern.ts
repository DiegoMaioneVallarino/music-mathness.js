import type {
    PianoPattern
} from "./types"


export function createPianoPattern(
    name: string,
    color: string,
    bars = 1,
    resolution = 0.25
): PianoPattern {

    return {
        id: crypto.randomUUID(),

        type: "piano",

        name,
        color,

        bars,
        resolution,

        notes: []
    }
}