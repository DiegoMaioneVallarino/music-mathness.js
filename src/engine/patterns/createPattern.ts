import type {
    StepPattern
} from "./types"


export function createPattern(
    name: string,
    color: string,
    bars = 1,
    resolution = 0.5
): StepPattern {

    return {

        id:
            crypto.randomUUID(),

        type:
            "step",

        name,

        color,

        bars,

        resolution,

        layers: []
    }
}