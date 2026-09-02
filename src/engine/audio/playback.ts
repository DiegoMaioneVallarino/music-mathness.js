import type {
    Pattern
} from "../patterns/types"

import {
    getStepDurationMs
} from "./scheduler"

import type {
    Sample
} from "./samples"

import type {
    StepPattern
} from "../patterns/types"

let playbackTimer: number | null = null

let currentStep = 0


export function playSample(
    sampleUrl: string
) {

    const audio =
        new Audio(sampleUrl)

    audio.play()
}


export function playPatternLoop(
    pattern: StepPattern,
    bpm: number,
    samples: Sample[],
    onStep?: (stepIndex: number) => void
) {

    stopPattern()


    const totalSteps =
        pattern.layers[0]?.steps.length ?? 0


    if (totalSteps === 0) {
        return
    }


    const stepDuration =
        getStepDurationMs(
            bpm,
            pattern.resolution
        )


    function playCurrentStep() {

        onStep?.(
            currentStep
        )


        pattern.layers.forEach(
            layer => {

                const isActive =
                    layer.steps[currentStep] === 1


                if (
                    !isActive ||
                    !layer.sampleId
                ) {
                    return
                }


                const sample =
                    samples.find(
                        sample =>
                            sample.id ===
                            layer.sampleId
                    )


                if (!sample) {
                    return
                }


                playSample(
                    sample.url
                )
            }
        )


        currentStep =
            (currentStep + 1)
            % totalSteps


        playbackTimer =
            window.setTimeout(
                playCurrentStep,
                stepDuration
            )
    }


    currentStep = 0

    playCurrentStep()
}


export function stopPattern() {

    if (
        playbackTimer !== null
    ) {

        window.clearTimeout(
            playbackTimer
        )

        playbackTimer = null
    }


    currentStep = 0
}