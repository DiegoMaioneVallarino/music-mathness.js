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
    PianoPattern,
    CyclePattern,
    TonalCyclePattern
} from "../patterns/types"


import type {
    TimelineTrack
} from "../timeline/types"

import {
    getCycleEventTimes
} from "../patterns/cycle"

import {
    createTonalCyclePositions,
    getTonalTraversal
} from "../music/tonalCycles/tonalCycle"

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
    getTracks:
        () => TimelineTrack[],
    getPatterns:
        () => Pattern[],
    bpm: number,
    getSamples:
        () => Sample[],
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

          const tracks =
        getTracks()

    const patterns =
        getPatterns()

    const samples =
        getSamples()

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
export function playCyclePatternLoop(
    getPattern:
        () =>
            CyclePattern |
            undefined,

    bpm: number,

    getSamples:
        () => Sample[]
) {

    stopPattern()


    /*
        Beat en milisegundos.

        Por ejemplo:

        130 BPM

        60000 / 130
        ≈ 461.53ms
    */

    const beatDurationMs =
        60000 / bpm


    /*
        Guardamos en qué punto
        temporal del ciclo estamos.
    */

    let previousEventTime =
        0


    function scheduleCycle() {

        const pattern =
            getPattern()


        if (!pattern) {
            return
        }


        const samples =
            getSamples()


        /*
            Construimos todos los eventos
            geométricos del ciclo.
        */

        const events =
            pattern.layers.flatMap(
                layer => {

                    const times =
                        getCycleEventTimes(
                            pattern.cycleBeats,
                            layer.division,
                            layer.phase
                        )


                    return times.map(
                        time => ({
                            time,
                            layer
                        })
                    )
                }
            )


        /*
            Orden cronológico.

            Ejemplo:

            Kick /3
            Snare /4

            podría producir:

            0
            0
            2
            2.666...
            4
            5.333...
            6
        */

        events.sort(
            (a, b) =>
                a.time -
                b.time
        )


        if (
            events.length === 0
        ) {

            playbackTimer =
                window.setTimeout(
                    scheduleCycle,
                    pattern.cycleBeats *
                        beatDurationMs
                )

            return
        }


        let eventIndex =
            0


        previousEventTime =
            0


        function playNextEvent() {

            /*
                Volvemos a consultar el pattern.

                IMPORTANTE:
                esto permite edición en caliente.
            */

            const currentPattern =
                getPattern()


            if (!currentPattern) {
                return
            }


            /*
                Cuando terminamos todos
                los eventos, comenzamos
                un ciclo nuevo.

                Y volvemos a calcularlos,
                por lo que division/phase
                pueden haber cambiado.
            */

            if (
                eventIndex >=
                events.length
            ) {

                const remainingBeats =
                    currentPattern.cycleBeats -
                    previousEventTime


                playbackTimer =
                    window.setTimeout(

                        scheduleCycle,

                        remainingBeats *
                            beatDurationMs
                    )

                return
            }


            const event =
                events[eventIndex]


            const delayBeats =
                event.time -
                previousEventTime


            playbackTimer =
                window.setTimeout(
                    () => {

                        /*
                            Leemos los samples actuales.
                        */

                        const currentSamples =
                            getSamples()


                        if (
                            event.layer.sampleId
                        ) {

                            const sample =
                                currentSamples.find(
                                    sample =>
                                        sample.id ===
                                        event.layer.sampleId
                                )


                            if (sample) {

                                playSample(
                                    sample.url
                                )
                            }
                        }


                        previousEventTime =
                            event.time


                        eventIndex++


                        playNextEvent()
                    },

                    Math.max(
                        0,
                        delayBeats *
                            beatDurationMs
                    )
                )
        }


        playNextEvent()
    }


    scheduleCycle()
}

export function playTonalCyclePatternLoop(
    getPattern:
        () =>
            TonalCyclePattern |
            undefined,

    bpm: number
) {

    stopPattern()


    const beatDurationMs =
        60000 / bpm


    function scheduleCycle() {

        const pattern =
            getPattern()


        if (!pattern) {
            return
        }


        /*
            C major:

            0 1 2 3 4 5 6 5 4 3 2 1

            con repetitions = 1
        */

        const tonalPositions =
    createTonalCyclePositions(
        pattern.scaleIntervals.length,
        pattern.octaveSpan
    )

const totalPositions =
    tonalPositions.length


        /*
            Ejemplo:

            DIVIDE 4:
            [0, 3, 6, 9]

            STEP 4:
            [0, 4, 8]
        */

        const traversal =
            getTonalTraversal(
                pattern.traversalMode,
                totalPositions,
                pattern.amount,
                pattern.rotation
            )


        if (
            traversal.length === 0
        ) {

            playbackTimer =
                window.setTimeout(
                    scheduleCycle,
                    pattern.cycleBeats *
                        beatDurationMs
                )

            return
        }


        /*
            Distribuimos los vértices
            uniformemente en el ciclo.
        */

        const spacingBeats =
            pattern.cycleBeats /
            traversal.length


        /*
            Dejamos un poquito de espacio
            entre notas para que se distinga
            la secuencia.
        */



        let eventIndex =
            0


        function playNextNote() {

    const currentPattern =
        getPattern()


    if (!currentPattern) {
        return
    }


    const noteDurationSeconds =
        (
            spacingBeats *
            60 /
            bpm
        ) *
        currentPattern.gate


    if (
        eventIndex >=
        traversal.length
    ) {

        playbackTimer =
            window.setTimeout(
                scheduleCycle,
                spacingBeats *
                    beatDurationMs
            )

        return
    }


   const positionIndex =
    traversal[
        eventIndex
    ]

const position =
    tonalPositions[
        positionIndex
    ]

    if (!position) {
    eventIndex++
    playNextNote()
    return
}

const interval =
    currentPattern.scaleIntervals[
        position.degree
    ]

const midi =
    currentPattern.rootMidi +
    interval +
    position.octaveOffset *
        12

playMidiNote(
    midi,
    noteDurationSeconds,
    100
)

eventIndex++

    eventIndex++


    if (
        eventIndex >=
        traversal.length
    ) {

        playbackTimer =
            window.setTimeout(
                scheduleCycle,
                spacingBeats *
                    beatDurationMs
            )

        return
    }


    playbackTimer =
        window.setTimeout(
            playNextNote,
            spacingBeats *
                beatDurationMs
        )
}


        playNextNote()
    }


    scheduleCycle()
}

export function playPianoPatternLoop(
    getPattern:
        () =>
            PianoPattern |
            undefined,
    bpm: number,
    onStep?: (
        stepIndex: number
    ) => void
) {

    stopPattern()


    function playCurrentStep() {

        /*
            Leemos el pattern ACTUAL,
            no el pattern que existía
            al pulsar PLAY.
        */

        const pattern =
            getPattern()


        if (!pattern) {
            return
        }


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
                        ) /
                        1000


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
    getPattern: () => StepPattern | undefined,
    bpm: number,
    getSamples: () => Sample[],
    onStep?: (
        stepIndex: number
    ) => void
) {

    stopPattern()


    const initialPattern =
        getPattern()


    if (!initialPattern) {
        return
    }


    const stepDuration =
        getStepDurationMs(
            bpm,
            initialPattern.resolution
        )


    function playCurrentStep() {

        const pattern =
            getPattern()


        if (!pattern) {
            return
        }


        const totalSteps =
            pattern.layers[0]
                ?.steps.length ?? 0


        if (
            totalSteps === 0
        ) {
            return
        }


        onStep?.(
            currentStep
        )


        const samples =
            getSamples()


        pattern.layers.forEach(
            layer => {

                const isActive =
                    layer.steps[
                        currentStep
                    ] === 1


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