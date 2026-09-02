import {
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

import "./App.css"


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
        samples,
        setSamples
    ] = useState<Sample[]>(
        DEFAULT_SAMPLES
    )


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


                        if (
                            pattern.type !== "step"
                        ) {
                            return pattern
                        }


                        return addSampleLayer(
                            pattern,
                            sampleName,
                            sampleId
                        )
                    }
                )
        )
    }


    /*
        Importar archivos de audio
        desde la computadora.
    */

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
            selectedPattern.bars * 4


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

    function handlePlay() {

        if (!selectedPattern) {
            return
        }


        if (
            selectedPattern.type !== "step"
        ) {
            return
        }


        playPatternLoop(
            selectedPattern,
            BPM,
            samples,
            setCurrentStep
        )
    }


    function handleStop() {

        stopPattern()

        setCurrentStep(null)
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
                                            pattern.type ===
                                            "piano"

                                                ? " PIANO"

                                                : " STEP"
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


                </header>


                {/* PATTERN EDITOR */}

                {
                    selectedPattern ? (

                        selectedPattern.type ===
                        "step"

                            ? (

                                <PatternGrid

                                    pattern={
                                        selectedPattern
                                    }

                                    onToggleStep={
                                        handleToggleStep
                                    }

                                    currentStep={
                                        currentStep
                                    }

                                />

                            )

                            : (

                                <section className="piano-placeholder">

                                    <h3>
                                        {
                                            selectedPattern.name
                                        }
                                    </h3>

                                    <p>
                                        Piano Roll
                                    </p>

                                    <p>
                                        🎹 próximamente
                                    </p>

                                </section>

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

                    onPlacePattern={
                        handlePlacePattern
                    }

                />


            </section>


        </main>
    )
}


export default App