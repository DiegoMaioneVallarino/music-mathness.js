import type {
    StepPattern,
    Step
} from "./types"


export function toggleStep(
    pattern: StepPattern,
    layerId: string,
    stepIndex: number
): StepPattern {

    return {
        ...pattern,

        layers:
            pattern.layers.map(
                layer => {

                    if (
                        layer.id !== layerId
                    ) {
                        return layer
                    }


                    const newSteps = [
                        ...layer.steps
                    ]


                    const currentStep =
                        newSteps[stepIndex]


                    newSteps[stepIndex] =
                        currentStep === 1
                            ? 0
                            : 1


                    return {
                        ...layer,

                        steps:
                            newSteps as Step[]
                    }
                }
            )
    }
}