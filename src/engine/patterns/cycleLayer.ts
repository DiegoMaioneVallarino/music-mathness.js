import type {
    CyclePattern,
    CycleLayer
} from "./types"


export function addCycleLayer(
    pattern: CyclePattern,
    name: string,
    sampleId: string,
    division = 4
): CyclePattern {

    const layer: CycleLayer = {

        id:
            crypto.randomUUID(),

        name,

        sampleId,

        division,

        phase: 0
    }


    return {
        ...pattern,

        layers: [
            ...pattern.layers,
            layer
        ]
    }
}

export function setCycleLayerDivision(
    pattern: CyclePattern,
    layerId: string,
    division: number
): CyclePattern {

    const safeDivision =
        Math.max(
            1,
            Math.round(division)
        )


    return {
        ...pattern,

        layers:
            pattern.layers.map(
                layer => {

                    if (
                        layer.id !==
                        layerId
                    ) {
                        return layer
                    }


                    return {
                        ...layer,
                        division:
                            safeDivision
                    }
                }
            )
    }
}


export function setCycleLayerPhase(
    pattern: CyclePattern,
    layerId: string,
    phase: number
): CyclePattern {

    return {
        ...pattern,

        layers:
            pattern.layers.map(
                layer => {

                    if (
                        layer.id !==
                        layerId
                    ) {
                        return layer
                    }


                    return {
                        ...layer,
                        phase
                    }
                }
            )
    }
}