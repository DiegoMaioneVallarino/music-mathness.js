import {
    useState
} from "react"

import "./styles.css"


export type TonalBaseNote = {
    id: string
    name: string
    interval: number
    midi?: number
}


type Props = {
    notes:
        TonalBaseNote[]

    onNotesChange: (
        notes:
            TonalBaseNote[]
    ) => void

    playbackProgress:
        number

    isPlaying:
        boolean
}


type PianoKey = {
    midi: number
    pitchClass: number
    name: string
    octave: number
    accidental: boolean
}


const NOTE_NAMES = [
    "C",
    "Db",
    "D",
    "Eb",
    "E",
    "F",
    "Gb",
    "G",
    "Ab",
    "A",
    "Bb",
    "B"
]


/*
    Cinco octavas:

    C2 → B6

    MIDI:
    C2 = 36
    B6 = 95
*/

function createPianoKeys(): PianoKey[] {

    const keys:
        PianoKey[] = []


    for (
        let midi = 36;
        midi <= 95;
        midi++
    ) {

        const pitchClass =
            midi % 12


        const octave =
            Math.floor(
                midi / 12
            ) - 1


        const name =
            NOTE_NAMES[
                pitchClass
            ]


        const accidental =
            [
                1,
                3,
                6,
                8,
                10
            ].includes(
                pitchClass
            )


        keys.push({
            midi,
            pitchClass,
            name,
            octave,
            accidental
        })
    }


    return keys
}


const PIANO_KEYS =
    createPianoKeys()
const NOTE_FAMILY_COLORS:
    Record<string, string> = {

    C:
        "#a855f7",

    D:
        "#3b82f6",

    E:
        "#22c55e",

    F:
        "#eab308",

    G:
        "#f97316",

    A:
        "#ef4444",

    B:
        "#ec4899"
}


function getNoteFamily(
    noteName: string
): string {

    return noteName
        .charAt(
            0
        )
        .toUpperCase()
}


function getNoteColor(
    noteName: string
): string {

    const family =
        getNoteFamily(
            noteName
        )


    return (
        NOTE_FAMILY_COLORS[
            family
        ] ??
        "#888888"
    )
}

export default function TonalBaseEditor({
    notes,
    onNotesChange,
    playbackProgress,
    isPlaying
}: Props) {


    const [
        selectedNoteId,
        setSelectedNoteId
    ] =
        useState<string | null>(
            null
        )


        const SIZE =
            600

        const CENTER =
            SIZE / 2

        const RADIUS =
            185

    /*
        El piano solamente está bloqueado
        si NO existe una posición activa.
    */

    const pianoUnlocked =
        selectedNoteId !==
        null


    /*
        CÍRCULO DE LA BASE
    */

const points =
    notes.map(
        (
            note,
            index
        ) => {

            const angle =
                -Math.PI / 2 +
                (
                    index /
                    notes.length
                ) *
                Math.PI *
                2

           return {
    ...note,

    color:
        getNoteColor(
            note.name
        ),

    x:
        CENTER +
        Math.cos(
            angle
        ) *
        RADIUS,

    y:
        CENTER +
        Math.sin(
            angle
        ) *
        RADIUS
}
        }
    )


/*
    Qué nota está siendo
    atravesada por el playback
*/

const activeNoteIndex =
    notes.length > 0

        ? Math.floor(
            playbackProgress *
            notes.length
        ) %
        notes.length

        : -1


/*
    Posición de la manecilla
*/

const playheadAngle =
    -Math.PI / 2 +
    playbackProgress *
    Math.PI *
    2


const playheadLength =
    RADIUS - 18


const playheadX =
    CENTER +
    Math.cos(
        playheadAngle
    ) *
    playheadLength


const playheadY =
    CENTER +
    Math.sin(
        playheadAngle
    ) *
    playheadLength
        


    /*
        CREAR POSICIÓN

        + ADD NOTE crea el bloque.

        El piano solamente decide
        qué pitch ocupa ese bloque.
    */

    function handleAddNote() {

        const id =
            crypto.randomUUID()


        onNotesChange([
            ...notes,

            {
                id,

                name:
                    "—",

                interval:
                    0,

                midi:
                    undefined
            }
        ])


        /*
            Automáticamente editamos
            la posición recién creada.
        */

        setSelectedNoteId(
            id
        )
    }


    /*
        ELEGIR QUÉ POSICIÓN
        ESTAMOS EDITANDO
    */

    function handleSelectNote(
        id: string
    ) {

        setSelectedNoteId(
            id
        )
    }


    /*
        PULSAR UNA TECLA

        IMPORTANTE:

        NO deseleccionamos el bloque.

        Eso permite probar notas
        sucesivamente sobre la misma
        posición.
    */

    function handlePianoKeyClick(
        key: PianoKey
    ) {

        if (
            !selectedNoteId
        ) {
            return
        }


        onNotesChange(
            notes.map(
                note => {

                    if (
                        note.id !==
                        selectedNoteId
                    ) {
                        return note
                    }


                    return {
                        ...note,

                        name:
                            `${key.name}${key.octave}`,

                        interval:
                            key.pitchClass,

                        midi:
                            key.midi
                    }
                }
            )
        )
    }


    function handleRemoveNote(
        id: string
    ) {

        onNotesChange(
            notes.filter(
                note =>
                    note.id !==
                    id
            )
        )


        if (
            selectedNoteId ===
            id
        ) {

            setSelectedNoteId(
                null
            )
        }
    }


    /*
        LA NOTA ACTUALMENTE
        ASIGNADA AL BLOQUE ACTIVO
    */

    const selectedBaseNote =
        notes.find(
            note =>
                note.id ===
                selectedNoteId
        )


    return (

        <div
            className="tonal-base-editor"
        >

            {/*
                ===========================
                BASE
                ===========================
            */}

            <aside
                className="tonal-base-editor__sidebar"
            >

                <div
                    className="tonal-base-editor__title"
                >
                    TONAL BASE
                </div>


                <div
                    className="tonal-base-editor__notes"
                >

                    {
                        notes.map(
                            (
                                note,
                                index
                            ) => {

                                const selected =
                                    note.id ===
                                    selectedNoteId


                                return (

                                    <div
                                        key={
                                            note.id
                                        }

                                        className={[
                                            "tonal-base-note",

                                            selected
                                                ? "tonal-base-note--selected"
                                                : ""

                                        ].join(
                                            " "
                                        )}
                                    >

                                        <span
                                            className="tonal-base-note__index"
                                        >
                                            {
                                                index + 1
                                            }
                                        </span>


                                        <button

                                            className="tonal-base-note__select"

                                            onClick={
                                                () =>
                                                    handleSelectNote(
                                                        note.id
                                                    )
                                            }
                                        >

                                            <strong>
                                                {
                                                    note.name
                                                }
                                            </strong>


                                            <span>
                                                {
                                                    note.midi ===
                                                    undefined

                                                        ? "SELECT NOTE"

                                                        : `MIDI ${note.midi}`
                                                }
                                            </span>

                                        </button>


                                        <button

                                            className="tonal-base-note__remove"

                                            onClick={
                                                () =>
                                                    handleRemoveNote(
                                                        note.id
                                                    )
                                            }
                                        >
                                            ×
                                        </button>

                                    </div>

                                )
                            }
                        )
                    }

                </div>


                <button
                    className="tonal-base-editor__add"

                    onClick={
                        handleAddNote
                    }
                >
                    + ADD NOTE
                </button>

            </aside>


            {/*
                ===========================
                PIANO
                ===========================
            */}

            <div
                className={[
                    "tonal-base-editor__piano-panel",

                    pianoUnlocked
                        ? "tonal-base-editor__piano-panel--active"
                        : ""

                ].join(
                    " "
                )}
            >

                <div
                    className="tonal-base-editor__piano-header"
                >

                    <span>
                        NOTE INPUT
                    </span>


                    <strong>
                        {
                            pianoUnlocked

                                ? selectedBaseNote?.name ===
                                    "—"

                                    ? "SELECT NOTE"

                                    : `EDIT ${selectedBaseNote?.name}`

                                : "SELECT BASE POSITION"
                        }
                    </strong>

                </div>


                <div
                    className={[
                        "tonal-piano",

                        pianoUnlocked
                            ? "tonal-piano--active"
                            : "tonal-piano--locked"

                    ].join(
                        " "
                    )}
                >

                    {/*
                        Primero dibujamos
                        las teclas naturales.
                    */}

                    {
                        PIANO_KEYS
                            .filter(
                                key =>
                                    !key.accidental
                            )
                            .reverse()
                            .map(
                                key => {

                                    const active =
                                        selectedBaseNote?.midi ===
                                        key.midi


                                    return (

                                        <button

                                            key={
                                                key.midi
                                            }

                                            disabled={
                                                !pianoUnlocked
                                            }

                                            className={[
                                                "tonal-piano__white-key",

                                                active
                                                    ? "tonal-piano__white-key--active"
                                                    : ""

                                            ].join(
                                                " "
                                            )}

                                            onClick={
                                                () =>
                                                    handlePianoKeyClick(
                                                        key
                                                    )
                                            }
                                        >

                                            <span>
                                                {
                                                    key.name
                                                }{
                                                    key.octave
                                                }
                                            </span>

                                            <small>
                                                {
                                                    key.midi
                                                }
                                            </small>

                                        </button>

                                    )
                                }
                            )
                    }


                    {/*
                        Después superponemos
                        los semitonos.
                    */}

                    <div
                        className="tonal-piano__black-layer"
                    >

                        {
                            PIANO_KEYS
                                .filter(
                                    key =>
                                        key.accidental
                                )
                                .reverse()
                                .map(
                                    key => {

                                        const active =
                                            selectedBaseNote?.midi ===
                                            key.midi


                                        /*
                                            Cada octava tiene
                                            siete teclas blancas.

                                            Calculamos dónde vive
                                            el semitono dentro
                                            de esa geometría.
                                        */

                                        const octaveFromTop =
                                            6 -
                                            key.octave


                                        const whiteIndex =
                                            octaveFromTop *
                                            7 +
                                            getBlackKeyWhiteIndex(
                                                key.pitchClass
                                            )


                                        return (

                                            <button

                                                key={
                                                    key.midi
                                                }

                                                disabled={
                                                    !pianoUnlocked
                                                }

                                                className={[
                                                    "tonal-piano__black-key",

                                                    active
                                                        ? "tonal-piano__black-key--active"
                                                        : ""

                                                ].join(
                                                    " "
                                                )}

                                                style={{
                                                    top:
                                                        `calc(${
                                                            whiteIndex
                                                        } * var(--white-key-height) + var(--black-key-offset))`
                                                }}

                                                onClick={
                                                    () =>
                                                        handlePianoKeyClick(
                                                            key
                                                        )
                                                }
                                            >

                                                <span>
                                                    {
                                                        key.name
                                                    }{
                                                        key.octave
                                                    }
                                                </span>

                                            </button>

                                        )
                                    }
                                )
                        }

                    </div>

                </div>

            </div>


            {/*
                ===========================
                CÍRCULO
                ===========================
            */}

            <div
                className="tonal-base-editor__visual"
            >

                <div
                    className="tonal-base-editor__count"
                >
                    {
                        notes.length
                    } POSITIONS
                </div>


                <svg
    viewBox={
        `0 0 ${SIZE} ${SIZE}`
    }

    className="tonal-base-editor__svg"
>

    {/*
        CÍRCULO DEL MÓDULO
    */}

    <circle
        cx={
            CENTER
        }

        cy={
            CENTER
        }

        r={
            RADIUS
        }

        fill="none"

        stroke="#5b1d78"

        strokeWidth={
            2
        }
    />


    {/*
        NODOS DE LA BASE
    */}

   {
    points.map(
        (
            point,
            index
        ) => {

            const active =
                isPlaying &&
                index === activeNoteIndex

            return (

                <g
                    key={
                        point.id
                    }
                >

                    <circle
                        cx={
                            point.x
                        }

                        cy={
                            point.y
                        }

                        r={
                            active
                                ? 14
                                : 10
                        }

                        fill={
                            point.color
                        }

                        stroke="#ffffff"

                        strokeWidth={
                            active
                                ? 3
                                : 1
                        }

                        className={
                            active
                                ? "tonal-base-editor__point tonal-base-editor__point--playing"
                                : "tonal-base-editor__point"
                        }
                    />


                    <text
                        x={
                            point.x
                        }

                        y={
                            point.y - 22
                        }

                        textAnchor="middle"

                        fill={
                            point.color
                        }

                        className="tonal-base-editor__label"
                    >
                        {
                            point.name
                        }
                    </text>

                </g>

            )
        }
    )
}


    {/*
        CENTRO
    */}

    <circle
        cx={
            CENTER
        }

        cy={
            CENTER
        }

        r={
            4
        }

        fill="#555"
    />
{
    isPlaying && (

        <g
            className="tonal-base-editor__playhead"
        >

            <line
                x1={
                    CENTER
                }

                y1={
                    CENTER
                }

                x2={
                    playheadX
                }

                y2={
                    playheadY
                }
            />


            <circle
                cx={
                    playheadX
                }

                cy={
                    playheadY
                }

                r={
                    6
                }
            />

        </g>

    )
}
</svg>

            </div>

        </div>
    )
}


/*
    POSICIÓN DEL SEMITONO
    ENTRE TECLAS BLANCAS.

    C# → entre C y D
    D# → entre D y E
    F# → entre F y G
    G# → entre G y A
    A# → entre A y B
*/

function getBlackKeyWhiteIndex(
    pitchClass: number
): number {

    switch (
        pitchClass
    ) {

        case 1:
            return 0.72

        case 3:
            return 1.72

        case 6:
            return 3.72

        case 8:
            return 4.72

        case 10:
            return 5.72

        default:
            return 0
    }
}