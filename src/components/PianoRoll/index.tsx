import type {
    PianoPattern
} from "../../engine/patterns/types"

import "./styles.css"


type PianoRollProps = {

    pattern: PianoPattern

    currentStep: number | null

    onToggleNote: (
        midi: number,
        startStep: number
    ) => void
}


const NOTE_NAMES = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B"
]


function midiToName(
    midi: number
): string {

    const note =
        NOTE_NAMES[
            midi % 12
        ]

    const octave =
        Math.floor(
            midi / 12
        ) - 1


    return `${note}${octave}`
}


function isBlackKey(
    midi: number
): boolean {

    const note =
        midi % 12


    return [
        1,
        3,
        6,
        8,
        10
    ].includes(note)
}


export default function PianoRoll({
    pattern,
    currentStep,
    onToggleNote
}: PianoRollProps) {

    /*
        3 octavas:

        C3 = MIDI 48
        hasta
        B5 = MIDI 83

        36 notas.
    */

    const MIN_MIDI = 48
    const MAX_MIDI = 83


    const midiNotes =
        Array.from(
            {
                length:
                    MAX_MIDI -
                    MIN_MIDI +
                    1
            },

            (_, index) =>
                MAX_MIDI - index
        )


    /*
        Ejemplo:

        resolution = 0.25

        4 beats / 0.25
        = 16 steps por compás
    */

    const totalSteps =
        pattern.bars *
        (
            4 /
            pattern.resolution
        )


    return (

        <section className="piano-roll">


            <header className="piano-roll__header">

                <span>
                    {pattern.name}
                </span>

                <span>
                    3 OCTAVES
                </span>

            </header>


            <div className="piano-roll__scroll">


                <div
                    className="piano-roll__grid"

                    style={{
                        gridTemplateColumns:
                            `70px repeat(${totalSteps}, 28px)`
                    }}
                >


                    {midiNotes.map(
                        midi => {

                            const black =
                                isBlackKey(
                                    midi
                                )


                            return (

                                <div
                                    className="piano-row"
                                    key={midi}
                                >


                                    <div
                                        className={[
                                            "piano-key",

                                            black
                                                ? "piano-key--black"
                                                : "piano-key--white"

                                        ].join(" ")}
                                    >

                                        {
                                            midiToName(
                                                midi
                                            )
                                        }

                                    </div>


                                    <div
                                        className="piano-note-cells"

                                        style={{
                                            gridTemplateColumns:
                                                `repeat(${totalSteps}, 28px)`
                                        }}
                                    >


                                        {Array.from({
                                            length:
                                                totalSteps
                                        }).map(
                                            (_, stepIndex) => {

                                                const active =
                                                    pattern.notes.some(
                                                        note =>
                                                            note.midi === midi &&
                                                            note.startStep ===
                                                                stepIndex
                                                    )


                                                return (

                                                    <button
                                                        key={
                                                            stepIndex
                                                        }

                                                        className={[
                                                            "piano-cell",

                                                            black
                                                                ? "piano-cell--black-row"
                                                                : "",

                                                            active
                                                                ? "piano-cell--active"
                                                                : "",

                                                            currentStep ===
                                                                stepIndex
                                                                ? "piano-cell--playing"
                                                                : ""

                                                        ].join(" ")}

                                                        onClick={() =>
                                                            onToggleNote(
                                                                midi,
                                                                stepIndex
                                                            )
                                                        }
                                                    />

                                                )
                                            }
                                        )}


                                    </div>

                                </div>

                            )
                        }
                    )}


                </div>


            </div>


        </section>
    )
}