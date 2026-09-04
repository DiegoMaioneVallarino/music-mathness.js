import {
    useEffect,
    useRef,
    useState
} from "react"




import PatternGrid from "./components/PatternGrid"
import Timeline from "./components/Timeline"

import {
    createPattern
} from "./engine/patterns/createPattern"

import {
    createPianoPattern
} from "./engine/patterns/createPianoPattern"

import {
    addSampleLayer
} from "./engine/patterns/layer"

import {
    toggleStep
} from "./engine/patterns/transformations"

import {
    playPatternLoop,
    playPianoPatternLoop,
    playCyclePatternLoop,
    playTonalCyclePatternLoop,
    playTimelineLoop,
    playPitchedSample,
    stopPattern
} from "./engine/audio/playback"

import {
    DEFAULT_SAMPLES
} from "./engine/audio/samples"

import type {
    Sample
} from "./engine/audio/samples"

import type {
    Pattern,
    TonalFigureMode
} from "./engine/patterns/types"
import type {
    TonalCombinationSequence
} from "./components/TonalCombinationEditor"
import type {
    TimelineTrack
} from "./engine/timeline/types"

import {
    placePattern
} from "./engine/timeline/placement"

import PianoRoll from "./components/PianoRoll"

import {
    togglePianoNote
} from "./engine/patterns/piano"

import {
    detectPitch
} from "./engine/audio/pitchDetection"

import {
    createCyclePattern
} from "./engine/patterns/createCyclePattern"

import {
    createTonalCyclePattern
} from "./engine/patterns/createTonalCyclePattern"
import CycleEditor from "./components/CycleEditor"

import {
    addCycleLayer,
    setCycleLayerDivision,
    setCycleLayerPhase
} from "./engine/patterns/cycleLayer"

import "./App.css"

import type {
    TonalPipelineStage
} from "./components/TonalPipeline"

import TonalCycleEditor from "./components/TonalCycleEditor"

import type {
    TonalBaseNote
} from "./components/TonalBaseEditor"

const BPM = 130


function createInitialPattern() {

    let pattern = createPattern(
        "Main Groove",
        "#a3e635"
    )


    pattern = addSampleLayer(
        pattern,
        "Kick",
        "kick_01"
    )


    pattern = addSampleLayer(
        pattern,
        "Snare",
        "snare_01"
    )


    pattern = addSampleLayer(
        pattern,
        "Hi Hat",
        "hat_01"
    )


    return pattern
}


function App() {

    /*
        Ahora patterns puede contener:

        StepPattern
        PianoPattern
        StepPattern
        PianoPattern
        ...
    */

    const [
        patterns,
        setPatterns
    ] = useState<Pattern[]>(() => [
        createInitialPattern()
    ])


    const [
        selectedPatternId,
        setSelectedPatternId
    ] = useState(
        patterns[0].id
    )


    const [
        currentStep,
        setCurrentStep
    ] = useState<number | null>(
        null
    )



      const [
          isPlaying,
          setIsPlaying
      ] = useState(false)


      const [
          playbackSeconds,
          setPlaybackSeconds
      ] = useState(0)


      const [
          playbackDurationSeconds,
          setPlaybackDurationSeconds
      ] = useState(0)

const playbackStartRef =
    useRef<number | null>(
        null
    )

const tonalBasePlaybackCancelRef =
    useRef<
        (() => void) |
        null
    >(
        null
    )

const playbackDurationRef =
    useRef(0)
      
  const [
      currentTimelineBeat,
      setCurrentTimelineBeat
  ] = useState<number | null>(
      null
)

    const [
        samples,
        setSamples
    ] = useState<Sample[]>(
        DEFAULT_SAMPLES
    )

      const [
          playbackMode,
          setPlaybackMode
      ] = useState<
          "pattern" |
          "timeline"
      >(
          "pattern"
      )
      const cycleProgress =
    playbackDurationSeconds > 0
        ? playbackSeconds /
            playbackDurationSeconds
        : 0

    const [
        timelineTracks,
        setTimelineTracks
    ] = useState<TimelineTrack[]>(() => [

        {
            id: crypto.randomUUID(),
            name: "Track 1",
            clips: []
        },

        {
            id: crypto.randomUUID(),
            name: "Track 2",
            clips: []
        },

        {
            id: crypto.randomUUID(),
            name: "Track 3",
            clips: []
        }

    ])


      const [
    tonalStage,
    setTonalStage
] =
    useState<TonalPipelineStage>(
        "base"
    )
const [
    tonalBaseNotes,
    setTonalBaseNotes
] =
    useState<TonalBaseNote[]>([
        {
            id: crypto.randomUUID(),
            name: "C2",
            interval: 0,
            midi: 36
        },
        {
            id: crypto.randomUUID(),
            name: "D2",
            interval: 2,
            midi: 38
        },
        {
            id: crypto.randomUUID(),
            name: "E2",
            interval: 4,
            midi: 40
        },
        {
            id: crypto.randomUUID(),
            name: "F2",
            interval: 5,
            midi: 41
        },
        {
            id: crypto.randomUUID(),
            name: "G2",
            interval: 7,
            midi: 43
        },
        {
            id: crypto.randomUUID(),
            name: "A2",
            interval: 9,
            midi: 45
        },
        {
            id: crypto.randomUUID(),
            name: "B2",
            interval: 11,
            midi: 47
        }
    ])



const [
    activeCombinationSequenceId,
    setActiveCombinationSequenceId
] =
    useState<string | null>(
        null
    )


const [
    activeCombinationEventIndex,
    setActiveCombinationEventIndex
] =
    useState(
        -1
    )


const [
    tonalSampleId,
    setTonalSampleId
] =
    useState<string | null>(
        null
    )

          const patternsRef =
        useRef(patterns)

    patternsRef.current =
        patterns


    const timelineTracksRef =
        useRef(timelineTracks)

    timelineTracksRef.current =
        timelineTracks


    const samplesRef =
        useRef(samples)

    samplesRef.current =
        samples
async function handlePlayCombinationSequence(
    sequence:
        TonalCombinationSequence
) {

    const pitchedSample =
        samplesRef.current.find(
            sample =>
                sample.id ===
                tonalSampleId
        )


    if (
        !pitchedSample
    ) {
        return
    }


    setActiveCombinationSequenceId(
        sequence.id
    )


    for (
        let index = 0;
        index < sequence.events.length;
        index++
    ) {

        const event =
            sequence.events[
                index
            ]


        setActiveCombinationEventIndex(
            index
        )


        const durationSeconds =
            event.duration *
            (
                60 /
                BPM
            )


        playPitchedSample(
            pitchedSample,
            event.note.midi,
            durationSeconds
        )


        await new Promise<void>(
            resolve => {

                window.setTimeout(
                    resolve,
                    durationSeconds *
                    1000
                )
            }
        )
    }


    

    setActiveCombinationEventIndex(
        -1
    )
}
        useEffect(() => {

    if (!isPlaying) {
        return
    }


    let animationFrame = 0


    function updateClock(
        now: number
    ) {

        if (
            playbackStartRef.current ===
            null
        ) {
            playbackStartRef.current =
                now
        }


        const duration =
            playbackDurationRef.current


        if (
            duration <= 0
        ) {
            return
        }


        const elapsed =
            (
                now -
                playbackStartRef.current
            ) /
            1000


        /*
            El módulo hace que:

            0 → duración
            duración → 0
            0 → duración
            ...

            exactamente igual que nuestro loop.
        */

        const loopTime =
            elapsed %
            duration


        setPlaybackSeconds(
            loopTime
        )


        animationFrame =
            requestAnimationFrame(
                updateClock
            )
    }


    animationFrame =
        requestAnimationFrame(
            updateClock
        )


    return () => {

        cancelAnimationFrame(
            animationFrame
        )
    }

}, [isPlaying])

    const selectedPattern =
        patterns.find(
            pattern =>
                pattern.id === selectedPatternId
        )


    /*
        Añadir sample al pattern seleccionado.

        IMPORTANTE:

        Solo un StepPattern tiene layers.

        Un PianoPattern tiene notes.
    */

    function handleAddSampleToPattern(
    sampleId: string,
    sampleName: string
) {

    setPatterns(
        currentPatterns =>
            currentPatterns.map(
                pattern => {

                    if (
                        pattern.id !==
                        selectedPatternId
                    ) {
                        return pattern
                    }


                    /*
                        STEP
                    */

                    if (
                        pattern.type === "step"
                    ) {

                        return addSampleLayer(
                            pattern,
                            sampleName,
                            sampleId
                        )
                    }


                    /*
                        CYCLE
                    */

                    if (
                        pattern.type === "cycle"
                    ) {

                        return addCycleLayer(
                            pattern,
                            sampleName,
                            sampleId,
                            4
                        )
                    }


                    /*
                        PianoPattern no utiliza
                        samples todavía.
                    */

                    return pattern
                }
            )
    )
}
function startPlaybackClock(
    durationBeats: number
) {

    const beatSeconds =
        60 / BPM


    const durationSeconds =
        durationBeats *
        beatSeconds


    playbackDurationRef.current =
        durationSeconds


    playbackStartRef.current =
        performance.now()


    setPlaybackDurationSeconds(
        durationSeconds
    )


    setPlaybackSeconds(
        0
    )


    setIsPlaying(
        true
    )
}

function handleCycleDivisionChange(
    layerId: string,
    division: number
) {

    setPatterns(
        currentPatterns =>
            currentPatterns.map(
                pattern => {

                    if (
                        pattern.id !==
                        selectedPatternId
                    ) {
                        return pattern
                    }


                    if (
                        pattern.type !== "cycle"
                    ) {
                        return pattern
                    }


                    return setCycleLayerDivision(
                        pattern,
                        layerId,
                        division
                    )
                }
            )
    )
}

function handleCyclePhaseChange(
    layerId: string,
    phase: number
) {

    setPatterns(
        currentPatterns =>
            currentPatterns.map(
                pattern => {

                    if (
                        pattern.id !==
                        selectedPatternId
                    ) {
                        return pattern
                    }


                    if (
                        pattern.type !== "cycle"
                    ) {
                        return pattern
                    }


                    return setCycleLayerPhase(
                        pattern,
                        layerId,
                        phase
                    )
                }
            )
    )
}


    /*
        Importar archivos de audio
        desde la computadora.
    */
function handleTogglePianoNote(
    midi: number,
    startStep: number
) {

    setPatterns(
        currentPatterns =>
            currentPatterns.map(
                pattern => {

                    if (
                        pattern.id !==
                        selectedPatternId
                    ) {
                        return pattern
                    }


                    if (
                        pattern.type !==
                        "piano"
                    ) {
                        return pattern
                    }


                    return togglePianoNote(
                        pattern,
                        midi,
                        startStep
                    )
                }
            )
    )
}
   async function handleImportSample(
    event:
        React.ChangeEvent<HTMLInputElement>
) {

    const files =
        event.target.files


    if (!files) {
        return
    }


    const audioContext =
        new AudioContext()


    const importedSamples:
        Sample[] = []


    for (
        const file of
        Array.from(files)
    ) {

        /*
            URL que utilizaremos
            posteriormente para reproducir
            el sample.
        */

        const url =
            URL.createObjectURL(
                file
            )


        /*
            Convertimos el archivo
            en bytes.
        */

        const arrayBuffer =
            await file.arrayBuffer()


        /*
            Web Audio API convierte
            WAV / MP3 / etc.
            en muestras PCM.
        */

        const audioBuffer =
            await audioContext
                .decodeAudioData(
                    arrayBuffer
                )


        /*
            Nuestro detector matemático
            intenta descubrir la frecuencia
            fundamental.
        */

        const pitch =
            detectPitch(
                audioBuffer
            )


        console.log(
            "PITCH DETECTION",
            file.name,
            pitch
        )


        const sample: Sample = {

            id:
                crypto.randomUUID(),

            name:
                file.name,

            url,

            detectedMidi:
                pitch?.midi ??
                null,

            detectedFrequency:
                pitch?.frequency ??
                null,

            pitchConfidence:
                pitch?.confidence ??
                0
        }


        importedSamples.push(
            sample
        )
    }


    await audioContext.close()


    setSamples(
        currentSamples => [
            ...currentSamples,
            ...importedSamples
        ]
    )


    event.target.value =
        ""
}


    /*
        Activar / desactivar steps.

        Solo funciona en StepPattern.
    */
      function handleCreateCyclePattern() {

          const cyclePattern =
              createCyclePattern(
                  `Cycle ${patterns.length + 1}`,
                  "#f59e0b",
                  8
              )


          setPatterns(
              currentPatterns => [
                  ...currentPatterns,
                  cyclePattern
              ]
          )


          setSelectedPatternId(
              cyclePattern.id
          )


          handleStop()
      }

    function handleToggleStep(
        layerId: string,
        stepIndex: number
    ) {

        setPatterns(
            currentPatterns =>
                currentPatterns.map(
                    pattern => {

                        if (
                            pattern.id !==
                            selectedPatternId
                        ) {
                            return pattern
                        }


                        if (
                            pattern.type !== "step"
                        ) {
                            return pattern
                        }


                        return toggleStep(
                            pattern,
                            layerId,
                            stepIndex
                        )
                    }
                )
        )
    }


    /*
        Crear Step Pattern
    */

    function handleCreatePattern() {

        const newPattern =
            createPattern(
                `Pattern ${patterns.length + 1}`,
                "#a3e635"
            )


        setPatterns(
            currentPatterns => [
                ...currentPatterns,
                newPattern
            ]
        )


        setSelectedPatternId(
            newPattern.id
        )


        handleStop()
    }


    /*
        Crear Piano Pattern
    */

    function handleCreatePianoPattern() {

        const pianoPattern =
            createPianoPattern(
                `Piano ${patterns.length + 1}`,
                "#38bdf8"
            )


        setPatterns(
            currentPatterns => [
                ...currentPatterns,
                pianoPattern
            ]
        )


        setSelectedPatternId(
            pianoPattern.id
        )


        handleStop()
    }


    /*
        Colocar el pattern seleccionado
        dentro de una pista de la Timeline.
    */

    function handlePlacePattern(
        trackId: string,
        startBeat: number
    ) {

        if (!selectedPattern) {
            return
        }


        /*
            Por ahora asumimos 4/4.

            1 bar = 4 beats
            2 bars = 8 beats
            etc.
        */

        const lengthBeats =
    selectedPattern.type === "cycle" ||
    selectedPattern.type === "tonal-cycle"

        ? selectedPattern.cycleBeats

        : selectedPattern.bars * 4


        setTimelineTracks(
            currentTracks =>
                currentTracks.map(
                    track => {

                        if (
                            track.id !== trackId
                        ) {
                            return track
                        }


                        return placePattern(
                            track,
                            selectedPattern.id,
                            startBeat,
                            lengthBeats
                        )
                    }
                )
        )
    }


    /*
        Reproducción.

        Por ahora solamente reproducimos
        StepPatterns.

        El PianoPattern tendrá después
        su propio sintetizador / instrumento.
    */
function handleTonalFigureModeChange(
    mode: TonalFigureMode
) {

    setPatterns(
        currentPatterns =>
            currentPatterns.map(
                pattern => {

                    if (
                        pattern.id !==
                        selectedPatternId
                    ) {
                        return pattern
                    }


                    if (
                        pattern.type !==
                        "tonal-cycle"
                    ) {
                        return pattern
                    }


                    return {
                        ...pattern,

                        figures:
                            pattern.figures.map(
                                figure => {

                                    if (
                                        figure.id !==
                                        pattern.selectedFigureId
                                    ) {
                                        return figure
                                    }


                                    return {
                                        ...figure,
                                        mode
                                    }
                                }
                            )
                    }
                }
            )
    )
}


function handleTonalRegularStepChange(
    step: number
) {

    setPatterns(
        currentPatterns =>
            currentPatterns.map(
                pattern => {

                    if (
                        pattern.id !==
                        selectedPatternId
                    ) {
                        return pattern
                    }


                    if (
                        pattern.type !==
                        "tonal-cycle"
                    ) {
                        return pattern
                    }


                    const totalPositions =
                        pattern.scaleIntervals.length *
                        2 *
                        pattern.octaveSpan


                    /*
                        REGULAR solo acepta
                        divisores exactos
                        de nuestra base.
                    */

                    const normalizedStep =
                        Math.max(
                            1,
                            Math.min(
                                totalPositions,
                                Math.round(
                                    step
                                )
                            )
                        )


                    if (
                        totalPositions %
                        normalizedStep !==
                        0
                    ) {
                        return pattern
                    }


                    return {
                        ...pattern,

                        figures:
                            pattern.figures.map(
                                figure => {

                                    if (
                                        figure.id !==
                                        pattern.selectedFigureId
                                    ) {
                                        return figure
                                    }


                                    return {
                                        ...figure,

                                        regularStep:
                                            normalizedStep
                                    }
                                }
                            )
                    }
                }
            )
    )
}


function handleTonalFigureRotationChange(
    rotation: number
) {

    setPatterns(
        currentPatterns =>
            currentPatterns.map(
                pattern => {

                    if (
                        pattern.id !==
                        selectedPatternId
                    ) {
                        return pattern
                    }


                    if (
                        pattern.type !==
                        "tonal-cycle"
                    ) {
                        return pattern
                    }


                    const totalPositions =
                        pattern.scaleIntervals.length *
                        2 *
                        pattern.octaveSpan


                    if (
                        totalPositions <= 0
                    ) {
                        return pattern
                    }


                    const normalizedRotation =
                        (
                            (
                                rotation %
                                totalPositions
                            ) +
                            totalPositions
                        ) %
                        totalPositions


                    return {
                        ...pattern,

                        figures:
                            pattern.figures.map(
                                figure => {

                                    if (
                                        figure.id !==
                                        pattern.selectedFigureId
                                    ) {
                                        return figure
                                    }


                                    return {
                                        ...figure,

                                        rotation:
                                            normalizedRotation
                                    }
                                }
                            )
                    }
                }
            )
    )
}


function handleTonalIrregularStepChange(
    index: number,
    step: number
) {

    setPatterns(
        currentPatterns =>
            currentPatterns.map(
                pattern => {

                    if (
                        pattern.id !==
                        selectedPatternId
                    ) {
                        return pattern
                    }


                    if (
                        pattern.type !==
                        "tonal-cycle"
                    ) {
                        return pattern
                    }


                    return {
                        ...pattern,

                        figures:
                            pattern.figures.map(
                                figure => {

                                    if (
                                        figure.id !==
                                        pattern.selectedFigureId
                                    ) {
                                        return figure
                                    }


                                    const newSteps =
                                        [
                                            ...figure.steps
                                        ]


                                    if (
                                        index < 0 ||
                                        index >=
                                        newSteps.length
                                    ) {
                                        return figure
                                    }


                                    newSteps[
                                        index
                                    ] =
                                        Math.max(
                                            1,
                                            Math.round(
                                                step
                                            )
                                        )


                                    return {
                                        ...figure,

                                        steps:
                                            newSteps
                                    }
                                }
                            )
                    }
                }
            )
    )
}


function handleAddTonalIrregularStep() {

    setPatterns(
        currentPatterns =>
            currentPatterns.map(
                pattern => {

                    if (
                        pattern.id !==
                        selectedPatternId
                    ) {
                        return pattern
                    }


                    if (
                        pattern.type !==
                        "tonal-cycle"
                    ) {
                        return pattern
                    }


                    return {
                        ...pattern,

                        figures:
                            pattern.figures.map(
                                figure => {

                                    if (
                                        figure.id !==
                                        pattern.selectedFigureId
                                    ) {
                                        return figure
                                    }


                                    /*
                                        Si CLOSE estaba activo,
                                        al añadir otro step
                                        el nuevo step pasa a ser
                                        el último de la lista.

                                        Por eso dejamos CLOSE
                                        apagado temporalmente.
                                    */

                                    return {
                                        ...figure,

                                        steps: [
                                            ...figure.steps,
                                            1
                                        ],

                                        closeLastStep:
                                            false
                                    }
                                }
                            )
                    }
                }
            )
    )
}


function handleTonalCloseLastStepChange(
    close: boolean
) {

    setPatterns(
        currentPatterns =>
            currentPatterns.map(
                pattern => {

                    if (
                        pattern.id !==
                        selectedPatternId
                    ) {
                        return pattern
                    }


                    if (
                        pattern.type !==
                        "tonal-cycle"
                    ) {
                        return pattern
                    }


                    return {
                        ...pattern,

                        figures:
                            pattern.figures.map(
                                figure => {

                                    if (
                                        figure.id !==
                                        pattern.selectedFigureId
                                    ) {
                                        return figure
                                    }


                                    return {
                                        ...figure,

                                        closeLastStep:
                                            close
                                    }
                                }
                            )
                    }
                }
            )
    )
}


function handleSelectTonalFigure(
    figureId: string
) {

    setPatterns(
        currentPatterns =>
            currentPatterns.map(
                pattern => {

                    if (
                        pattern.id !==
                        selectedPatternId
                    ) {
                        return pattern
                    }


                    if (
                        pattern.type !==
                        "tonal-cycle"
                    ) {
                        return pattern
                    }


                    const exists =
                        pattern.figures.some(
                            figure =>
                                figure.id ===
                                figureId
                        )


                    if (
                        !exists
                    ) {
                        return pattern
                    }


                    return {
                        ...pattern,

                        selectedFigureId:
                            figureId
                    }
                }
            )
    )
}


function handleAddTonalFigure() {

    setPatterns(
        currentPatterns =>
            currentPatterns.map(
                pattern => {

                    if (
                        pattern.id !==
                        selectedPatternId
                    ) {
                        return pattern
                    }


                    if (
                        pattern.type !==
                        "tonal-cycle"
                    ) {
                        return pattern
                    }


                    const newFigureId =
                        crypto.randomUUID()


                    const newFigure = {

                        id:
                            newFigureId,

                        name:
                            `Figure ${
                                pattern.figures.length +
                                1
                            }`,

                        mode:
                            "regular" as const,

                        regularStep:
                            2,

                        steps: [
                            2
                        ],

                        closeLastStep:
                            false,

                        rotation:
                            0
                    }


                    return {
                        ...pattern,

                        figures: [
                            ...pattern.figures,
                            newFigure
                        ],

                        selectedFigureId:
                            newFigureId
                    }
                }
            )
    )
}


function handleTonalOctaveSpanChange(
    octaveSpan: number
) {

    setPatterns(
        currentPatterns =>
            currentPatterns.map(
                pattern => {

                    if (
                        pattern.id !==
                        selectedPatternId
                    ) {
                        return pattern
                    }


                    if (
                        pattern.type !==
                        "tonal-cycle"
                    ) {
                        return pattern
                    }


                    const nextOctaveSpan =
                        Math.max(
                            1,
                            Math.round(
                                octaveSpan
                            )
                        )


                    const totalPositions =
                        pattern.scaleIntervals.length *
                        2 *
                        nextOctaveSpan


                    return {
                        ...pattern,

                        octaveSpan:
                            nextOctaveSpan,


                        /*
                            Al cambiar la base,
                            normalizamos las rotaciones
                            de todas las figuras.
                        */

                        figures:
                            pattern.figures.map(
                                figure => ({

                                    ...figure,

                                    rotation:
                                        (
                                            (
                                                figure.rotation %
                                                totalPositions
                                            ) +
                                            totalPositions
                                        ) %
                                        totalPositions
                                })
                            )
                    }
                }
            )
    )
}




function handleTonalRootChange(
    rootMidi: number
) {

    setPatterns(
        currentPatterns =>
            currentPatterns.map(
                pattern => {

                    if (
                        pattern.id !==
                        selectedPatternId
                    ) {
                        return pattern
                    }

                    if (
                        pattern.type !==
                        "tonal-cycle"
                    ) {
                        return pattern
                    }

                    return {
                        ...pattern,
                        rootMidi
                    }
                }
            )
    )
}

function handleTonalGateChange(
    gate: number
) {

    setPatterns(
        currentPatterns =>
            currentPatterns.map(
                pattern => {

                    if (
                        pattern.id !==
                        selectedPatternId
                    ) {
                        return pattern
                    }

                    if (
                        pattern.type !==
                        "tonal-cycle"
                    ) {
                        return pattern
                    }

                    return {
                        ...pattern,

                        gate:
                            Math.max(
                                0.05,
                                Math.min(
                                    2,
                                    gate
                                )
                            )
                    }
                }
            )
    )
}
async function playCurrentTonalBase() {

    const sample =
        samplesRef.current.find(
            sample =>
                sample.id ===
                tonalSampleId
        )
console.log(
    "TONAL BASE DEBUG",
    {
        tonalStage,
        tonalSampleId,
        sample,
        notes:
            tonalBaseNotes
    }
)

    if (
        !sample
    ) {

        console.warn(
            "BASE: no hay tonal sample seleccionado"
        )

        return
    }


    if (
        sample.detectedMidi ===
            undefined ||
        sample.detectedMidi ===
            null
    ) {

        console.warn(
            "BASE: el sample no tiene pitch detectado"
        )

        return
    }


    const playableNotes =
        tonalBaseNotes.filter(
            (
                note
            ): note is TonalBaseNote & {
                midi: number
            } =>
                note.midi !==
                undefined
        )


    if (
        playableNotes.length ===
        0
    ) {
        return
    }


    stopPattern()


    /*
        De momento:

        cada nodo del módulo
        ocupa 1 beat.
    */

    const beatSeconds =
        60 /
        BPM


    /*
        Una vuelta completa:

        N posiciones
        =
        N beats
    */

    startPlaybackClock(
        playableNotes.length
    )


    /*
        Creamos una referencia
        que nos permita cancelar
        el loop con STOP.
    */

    let cancelled =
        false


    /*
        Guardamos la función de cancelación.

        La añadimos enseguida como ref.
    */

    tonalBasePlaybackCancelRef.current =
        () => {

            cancelled =
                true
        }


    while (
        !cancelled
    ) {

        for (
            const note
            of playableNotes
        ) {

            if (
                cancelled
            ) {
                return
            }


            playPitchedSample(
                sample,
                note.midi,
                beatSeconds
            )


            await new Promise<void>(
                resolve => {

                    window.setTimeout(
                        resolve,
                        beatSeconds *
                        1000
                    )
                }
            )
        }
    }
}
function handlePlay() {

    /*
        TIMELINE
    */

    if (
        playbackMode === "timeline"
    ) {
          startPlaybackClock(
              32
          )

        playTimelineLoop(

            () =>
                timelineTracksRef.current,

            () =>
                patternsRef.current,

            BPM,

            () =>
                samplesRef.current,

            setCurrentTimelineBeat
        )

        return
    }


    /*
        PATTERN
    */

    if (!selectedPattern) {
        return
    }


    /*
        STEP PATTERN
    */

    if (
        selectedPattern.type === "step"
    ) {

         const patternId =
        selectedPattern.id


    startPlaybackClock(
        selectedPattern.bars * 4
    )


        playPatternLoop(

            () => {

                const pattern =
                    patternsRef.current.find(
                        pattern =>
                            pattern.id ===
                            patternId
                    )


                if (
                    !pattern ||
                    pattern.type !== "step"
                ) {
                    return undefined
                }


                return pattern
            },

            BPM,

            () =>
                samplesRef.current,

            setCurrentStep
        )


        return
    }


    /*
        PIANO PATTERN
    */

    if (
    selectedPattern.type === "piano"
) {

    const patternId =
        selectedPattern.id

    startPlaybackClock(
        selectedPattern.bars * 4
    )

    playPianoPatternLoop(

        () => {

            const pattern =
                patternsRef.current.find(
                    pattern =>
                        pattern.id ===
                        patternId
                )


            if (
                !pattern ||
                pattern.type !== "piano"
            ) {
                return undefined
            }


            return pattern
        },

        BPM,

        setCurrentStep
    )


    return
}


if (
    selectedPattern.type === "cycle"
) {

    const patternId =
        selectedPattern.id

        startPlaybackClock(
        selectedPattern.cycleBeats
    )

    playCyclePatternLoop(

        () => {

            const pattern =
                patternsRef.current.find(
                    pattern =>
                        pattern.id ===
                        patternId
                )


            if (
                !pattern ||
                pattern.type !== "cycle"
            ) {
                return undefined
            }


            return pattern
        },

        BPM,

        () =>
            samplesRef.current
    )
}


if (
    selectedPattern.type ===
    "tonal-cycle"
) {

    /*
        =========================
        STAGE 1 — TONAL BASE
        =========================

        Aquí NO usamos el antiguo
        TonalCyclePattern.

        Reproducimos directamente
        las posiciones MIDI elegidas
        en nuestro piano.
    */

    if (
        tonalStage ===
        "base"
    ) {

        void playCurrentTonalBase()

        return
    }


    /*
        =========================
        STAGE 2 — SELECTION
        =========================

        Por ahora dejamos funcionando
        el playback anterior.

        En el siguiente paso lo
        conectaremos a baseNotes.
    */

    if (
        tonalStage ===
        "selection"
    ) {

        const patternId =
            selectedPattern.id


        startPlaybackClock(
            selectedPattern.cycleBeats
        )


        playTonalCyclePatternLoop(

            () => {

                const pattern =
                    patternsRef.current.find(
                        pattern =>
                            pattern.id ===
                            patternId
                    )


                if (
                    !pattern ||
                    pattern.type !==
                        "tonal-cycle"
                ) {

                    return undefined
                }


                return pattern
            },

            BPM,

            () =>
                samplesRef.current
        )


        return
    }


    /*
        =========================
        STAGE 3 — COMBINATION
        =========================

        No hacemos playback global.

        Cada secuencia tiene
        su propio botón ▶.
    */

    if (
        tonalStage ===
        "combination"
    ) {

        return
    }
}


}

function handleCreateTonalCyclePattern() {

    const pattern =
        createTonalCyclePattern(
            `Tonal Cycle ${patterns.length + 1}`,
            "#e879f9",
            60,
            8
        )


    setPatterns(
        currentPatterns => [
            ...currentPatterns,
            pattern
        ]
    )


    setSelectedPatternId(
        pattern.id
    )


    handleStop()
}

 function handleStop() {

    stopPattern()
    tonalBasePlaybackCancelRef.current?.()

    tonalBasePlaybackCancelRef.current =
    null

    setCurrentStep(
        null
    )


    setCurrentTimelineBeat(
        null
    )


    setIsPlaying(
        false
    )


    setPlaybackSeconds(
        0
    )


    playbackStartRef.current =
        null
}
function formatPlaybackTime(
    seconds: number
): string {

    const minutes =
        Math.floor(
            seconds / 60
        )


    const remainingSeconds =
        seconds % 60


    return (
        `${minutes
            .toString()
            .padStart(2, "0")
        }:${
            remainingSeconds
                .toFixed(2)
                .padStart(5, "0")
        }`
    )
}

    return (

        <main className="app">


            {/* LEFT BAR */}

            <aside className="leftbar">


               <div className="app-logo">
    <img
        src="/img/logo.png"
        alt="MusicMadness"
    />
</div>


                <section className="leftbar-section">


                    <div className="leftbar-title">
                        PATTERNS
                    </div>


                    <button
                        className="new-pattern-button"
                        onClick={
                            handleCreatePattern
                        }
                    >
                        + NEW STEP
                    </button>


                    <button
                        className="new-pattern-button"
                        onClick={
                            handleCreatePianoPattern
                        }
                    >
                        + NEW PIANO
                    </button>

                    <button
                    className="new-pattern-button"
                    onClick={
                        handleCreateCyclePattern
                    }
                >
                    + NEW CYCLE
                </button>

                <button
                className="new-pattern-button"
                onClick={
                    handleCreateTonalCyclePattern
                }
            >
                + NEW TONAL CYCLE
            </button>


                    <div className="pattern-library">


                        {patterns.map(
                            pattern => (

                                <button
                                    key={
                                        pattern.id
                                    }

                                    className={
                                        pattern.id ===
                                        selectedPatternId

                                            ? "pattern-item pattern-item--active"

                                            : "pattern-item"
                                    }

                                    onClick={() => {

                                        handleStop()

                                        setSelectedPatternId(
                                            pattern.id
                                        )
                                    }}
                                >

                                    <span>
                                        {
                                            pattern.name
                                        }
                                    </span>


                                    <small>
                                            {
                                                pattern.type === "step"
                                          ? "STEP"

                                          : pattern.type === "piano"
                                              ? "PIANO"

                                              : pattern.type === "cycle"
                                                  ? "CYCLE"

                                                  : "TONAL"
                                            }
                                        </small>

                                </button>

                            )
                        )}


                    </div>


                </section>


                {/* SAMPLE LIBRARY */}

                <section className="leftbar-section">


                    <div className="leftbar-title">
                        FILE LIBRARY
                    </div>


                    <label className="import-sample-button">

                        + IMPORT SAMPLE


                        <input
                            type="file"
                            accept="audio/*"
                            multiple

                            onChange={
                                handleImportSample
                            }
                        />

                    </label>


                    <div className="file-library">


                        {samples.map(
                            sample => (

                                <button
                                    className="file-item"

                                    key={
                                        sample.id
                                    }

                                    onClick={() =>
                                        handleAddSampleToPattern(
                                            sample.id,
                                            sample.name
                                        )
                                    }
                                >

                                    <span>
                                        ♫
                                    </span>


                                    <span>
                                        {
                                            sample.name
                                        }
                                    </span>

                                </button>

                            )
                        )}


                    </div>


                </section>


            </aside>


            {/* WORKSPACE */}

            <section className="workspace">


                {/* TRANSPORT */}

                <header className="transport">


                    <div>
                        BPM {BPM}
                    </div>

                  <div className="transport-time">

                      <span className="transport-time__current">

                          {
                              formatPlaybackTime(
                                  playbackSeconds
                              )
                          }

                      </span>


                      <span className="transport-time__separator">
                          /
                      </span>


                      <span className="transport-time__total">

                          {
                              formatPlaybackTime(
                                  playbackDurationSeconds
                              )
                          }

                      </span>

                  </div>
                    <button
                        onClick={
                            handlePlay
                        }
                    >
                        ▶ PLAY
                    </button>


                    <button
                        onClick={
                            handleStop
                        }
                    >
                        ■ STOP
                    </button>
                    <button
                        className="playback-mode-button"

                        onClick={() => {

                            handleStop()

                            setPlaybackMode(
                                current =>
                                    current === "pattern"
                                        ? "timeline"
                                        : "pattern"
                            )
                        }}
                    >

                        MODE:
                        {
                            playbackMode === "pattern"
                                ? " PATTERN"
                                : " TIMELINE"
                        }

                    </button>

                </header>


                {/* PATTERN EDITOR */}

                {
    selectedPattern ? (

        selectedPattern.type === "step"

            ? (

                <PatternGrid
                    pattern={
                        selectedPattern
                    }

                    currentStep={
                        currentStep
                    }

                    onToggleStep={
                        handleToggleStep
                    }
                />

            )

            : selectedPattern.type === "piano"

                ? (

                    <PianoRoll
                        pattern={
                            selectedPattern
                        }

                        currentStep={
                            currentStep
                        }

                        onToggleNote={
                            handleTogglePianoNote
                        }
                    />

                )

                : selectedPattern.type === "cycle"

                    ? (

                        <CycleEditor
                            pattern={
                                selectedPattern
                            }

                            playbackProgress={
                                playbackMode === "pattern" &&
                                playbackDurationSeconds > 0

                                    ? playbackSeconds /
                                        playbackDurationSeconds

                                    : 0
                            }

                            isPlaying={
                                isPlaying &&
                                playbackMode === "pattern"
                            }

                            onDivisionChange={
                                handleCycleDivisionChange
                            }

                            onPhaseChange={
                                handleCyclePhaseChange
                            }
                        />

                    )

                    : (

<TonalCycleEditor

    pattern={
        selectedPattern
    }

    playbackProgress={
        playbackMode === "pattern" &&
        playbackDurationSeconds > 0

            ? playbackSeconds /
                playbackDurationSeconds

            : 0
    }

    isPlaying={
        isPlaying &&
        playbackMode === "pattern"
    }

    onFigureModeChange={
        handleTonalFigureModeChange
    }

    onRegularStepChange={
        handleTonalRegularStepChange
    }

    onFigureRotationChange={
        handleTonalFigureRotationChange
    }

    onIrregularStepChange={
        handleTonalIrregularStepChange
    }

    onAddIrregularStep={
        handleAddTonalIrregularStep
    }

    onCloseLastStepChange={
        handleTonalCloseLastStepChange
    }

    onSelectFigure={
        handleSelectTonalFigure
    }

    onAddFigure={
        handleAddTonalFigure
    }

    onRootChange={
        handleTonalRootChange
    }

    onGateChange={
        handleTonalGateChange
    }

    onOctaveSpanChange={
        handleTonalOctaveSpanChange
    }
    activeStage={
    tonalStage
}

      onStageChange={
          setTonalStage
      }

      samples={
          samples
      }

      tonalSampleId={
          tonalSampleId
      }

      onTonalSampleChange={
          setTonalSampleId
      }
  onPlayCombinationSequence={
    handlePlayCombinationSequence
}

baseNotes={
    tonalBaseNotes
}

onBaseNotesChange={
    setTonalBaseNotes
}

activeCombinationSequenceId={
    activeCombinationSequenceId
}

activeCombinationEventIndex={
    activeCombinationEventIndex
}


/>

                    )

    ) : (

        <p>
            No pattern selected
        </p>

    )
}


                {/* TIMELINE */}

                <Timeline

              tracks={
                  timelineTracks
              }

              patterns={
                  patterns
              }

              currentBeat={
                  currentTimelineBeat
              }

              onPlacePattern={
                  handlePlacePattern
              }

          />


            </section>


        </main>
    )
}


export default App