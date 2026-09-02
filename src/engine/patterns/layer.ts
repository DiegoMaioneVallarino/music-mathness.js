import type {
    StepPattern,
    PatternLayer
} from "./types"


export function addSampleLayer(
    pattern: StepPattern,
    name: string,
    sampleId: string
): StepPattern {

    const totalSteps =
        pattern.bars *
        (4 / pattern.resolution)


    const layer: PatternLayer = {

        id: crypto.randomUUID(),

        name,

        sampleId,

        mode: "sample",

        steps:
            Array(totalSteps).fill(0)
    }


    return {
        ...pattern,

        layers: [
            ...pattern.layers,
            layer
        ]
    }
}