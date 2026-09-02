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
    StepPattern,
    PianoPattern
} from "../patterns/types"


import type {
    TimelineTrack
} from "../timeline/types"



let playbackTimer: number | null = null

let currentStep = 0
let audioContext:
    AudioContext |
    null = null


const activeOscillators =
    new Set<OscillatorNode>()


function getAudioContext() {

    if (!audioContext) {

        audioContext =
            new AudioContext()
    }


    return audioContext
}


function midiToFrequency(
    midi: number
): number {

    return (
        440 *
        Math.pow(
            2,
            (midi - 69) / 12
        )
    )
}

export function playSample(
    sampleUrl: string
) {

    const audio =
        new Audio(sampleUrl)

    audio.play()
}

function playMidiNote(
    midi: number,
    durationSeconds: number,
    velocity: number
) {

    const context =
        getAudioContext()


    const oscillator =
        context.createOscillator()


    const gain =
        context.createGain()


    oscillator.type =
        "sine"


    oscillator.frequency.value =
        midiToFrequency(
            midi
        )


    const volume =
        Math.min(
            velocity / 127,
            1
        ) * 0.2


    gain.gain.setValueAtTime(
        volume,
        context.currentTime
    )


    gain.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime +
            durationSeconds
    )


    oscillator.connect(
        gain
    )


    gain.connect(
        context.destination
    )


    activeOscillators.add(
        oscillator
    )


    oscillator.onended = () => {

        activeOscillators.delete(
            oscillator
        )
    }


    oscillator.start()


    oscillator.stop(
        context.currentTime +
            durationSeconds
    )
}

export function playTimelineLoop(
    tracks: TimelineTrack[],
    patterns: Pattern[],
    bpm: number,
    samples: Sample[],
    onBeat?: (
        beat: number
    ) => void
) {

    stopPattern()


    /*
        La timeline trabaja internamente
        a semicorcheas:

        0.25 beats
    */

    const timelineResolution =
        0.25


    const TOTAL_BEATS =
        32


    const totalTimelineSteps =
        TOTAL_BEATS /
        timelineResolution


    const tickDuration =
        getStepDurationMs(
            bpm,
            timelineResolution
        )


    let timelineStep = 0


    function playTimelineStep() {

        const globalBeat =
            timelineStep *
            timelineResolution


        onBeat?.(
            globalBeat
        )


        tracks.forEach(
            track => {

                track.clips.forEach(
                    clip => {

                        const clipEnd =
                            clip.startBeat +
                            clip.lengthBeats


                        if (
                            globalBeat <
                                clip.startBeat ||
                            globalBeat >=
                                clipEnd
                        ) {
                            return
                        }


                        const pattern =
                            patterns.find(
                                pattern =>
                                    pattern.id ===
                                    clip.patternId
                            )


                        if (!pattern) {
                            return
                        }


                        const localBeat =
                            globalBeat -
                            clip.startBeat


                        /*
                            STEP PATTERN
                        */

                        if (
                            pattern.type ===
                            "step"
                        ) {

                            const rawStep =
                                localBeat /
                                pattern.resolution


                            const stepIndex =
                                Math.round(
                                    rawStep
                                )


                            const exactStep =
                                Math.abs(
                                    rawStep -
                                    stepIndex
                                ) < 0.0001


                            if (!exactStep) {
                                return
                            }


                            pattern.layers.forEach(
                                layer => {

                                    if (
                                        layer.steps[
                                            stepIndex
                                        ] !== 1
                                    ) {
                                        return
                                    }


                                    if (
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
                        }


                        /*
                            PIANO PATTERN
                        */

                        if (
                            pattern.type ===
                            "piano"
                        ) {

                            const rawStep =
                                localBeat /
                                pattern.resolution


                            const stepIndex =
                                Math.round(
                                    rawStep
                                )


                            const exactStep =
                                Math.abs(
                                    rawStep -
                                    stepIndex
                                ) < 0.0001


                            if (!exactStep) {
                                return
                            }


                            pattern.notes
                                .filter(
                                    note =>
                                        note.startStep ===
                                        stepIndex
                                )
                                .forEach(
                                    note => {

                                        const beatDuration =
                                            60 / bpm


                                        const duration =
                                            pattern.resolution *
                                            note.lengthSteps *
                                            beatDuration


                                        playMidiNote(
                                            note.midi,
                                            duration,
                                            note.velocity
                                        )
                                    }
                                )
                        }
                    }
                )
            }
        )


        timelineStep =
            (
                timelineStep + 1
            ) %
            totalTimelineSteps


        playbackTimer =
            window.setTimeout(
                playTimelineStep,
                tickDuration
            )
    }


    playTimelineStep()
}

export function playPianoPatternLoop(
    pattern: PianoPattern,
    bpm: number,
    onStep?: (
        stepIndex: number
    ) => void
) {

    stopPattern()


    const totalSteps =
        pattern.bars *
        (
            4 /
            pattern.resolution
        )


    const stepDuration =
        getStepDurationMs(
            bpm,
            pattern.resolution
        )


    function playCurrentStep() {

        onStep?.(
            currentStep
        )


        pattern.notes
            .filter(
                note =>
                    note.startStep ===
                    currentStep
            )
            .forEach(
                note => {

                    const durationSeconds =
                        (
                            stepDuration *
                            note.lengthSteps
                        ) / 1000


                    playMidiNote(
                        note.midi,
                        durationSeconds,
                        note.velocity
                    )
                }
            )


        currentStep =
            (
                currentStep + 1
            ) %
            totalSteps


        playbackTimer =
            window.setTimeout(
                playCurrentStep,
                stepDuration
            )
    }


    currentStep = 0

    playCurrentStep()
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


    activeOscillators.forEach(
        oscillator => {

            try {
                oscillator.stop()
            } catch {
                // ya estaba detenido
            }
        }
    )


    activeOscillators.clear()


    currentStep = 0
}