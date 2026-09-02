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
    stopPattern
} from "./engine/audio/playback"

import {
    DEFAULT_SAMPLES
} from "./engine/audio/samples"

import type {
    Sample
} from "./engine/audio/samples"

import type {
    Pattern
} from "./engine/patterns/types"

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
    createCyclePattern
} from "./engine/patterns/createCyclePattern"

import CycleEditor from "./components/CycleEditor"

import {
    addCycleLayer,
    setCycleLayerDivision,
    setCycleLayerPhase
} from "./engine/patterns/cycleLayer"

import "./App.css"


import {
    createTonalCyclePattern
} from "./engine/patterns/createTonalCyclePattern"


import TonalCycleEditor from "./components/TonalCycleEditor"

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
    function handleImportSample(
        event:
            React.ChangeEvent<HTMLInputElement>
    ) {

        const files =
            event.target.files


        if (!files) {
            return
        }


        const importedSamples =
            Array.from(files).map(
                file => {

                    const sample: Sample = {

                        id:
                            crypto.randomUUID(),

                        name:
                            file.name,

                        url:
                            URL.createObjectURL(
                                file
                            )
                    }


                    return sample
                }
            )


        setSamples(
            currentSamples => [
                ...currentSamples,
                ...importedSamples
            ]
        )


        event.target.value = ""
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
function handleTonalModeChange(
    mode:
        "divide" |
        "step"
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
                        traversalMode:
                            mode
                    }
                }
            )
    )
}
function handleTonalAmountChange(
    amount: number
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

                        amount:
                            Math.max(
                                1,
                                Math.round(
                                    amount
                                )
                            )
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


                    return {
                        ...pattern,

                        octaveSpan:
                            Math.max(
                                1,
                                Math.round(
                                    octaveSpan
                                )
                            ),

                        /*
                            Reset prudente porque
                            ha cambiado el espacio
                            modular completo.
                        */

                        rotation: 0
                    }
                }
            )
    )
}
function handleTonalRotationChange(
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
                        rotation:
                            normalizedRotation
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

        BPM
    )


    return
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

    onModeChange={
        handleTonalModeChange
    }

    onAmountChange={
        handleTonalAmountChange
    }

    onRotationChange={
        handleTonalRotationChange
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