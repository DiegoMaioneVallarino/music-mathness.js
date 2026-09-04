import {
    useEffect,
    useState
} from "react"

import "./styles.css"


export type CombinationNote = {
    id: string
    name: string
    midi: number
}


export type TonalCombinationEvent = {
    note: CombinationNote
    duration: number
}


export type TonalCombinationSequence = {
    id: string
    events: TonalCombinationEvent[]
}


type Props = {
    notes:
        CombinationNote[]

    onPlaySequence: (
        sequence:
            TonalCombinationSequence
    ) => void
}


const AVAILABLE_DURATIONS = [
    4,
    2,
    1,
    0.5,
    0.25
]


const BATCH_SIZE =
    10


const INITIAL_MELODY_LENGTH =
    4


function randomItem<T>(
    values: T[]
): T {

    const index =
        Math.floor(
            Math.random() *
            values.length
        )


    return values[
        index
    ]
}


function generateRandomMelody(
    notes: CombinationNote[],
    durations: number[],
    melodyLength: number
): TonalCombinationSequence | null {

    if (
        notes.length ===
            0 ||
        durations.length ===
            0 ||
        melodyLength <=
            0
    ) {

        return null
    }


    const events =
        Array.from(
            {
                length:
                    melodyLength
            },

            () => ({

                note:
                    randomItem(
                        notes
                    ),

                duration:
                    randomItem(
                        durations
                    )
            })
        )


    return {
        id:
            crypto.randomUUID(),

        events
    }
}


function generateBatch(
    notes: CombinationNote[],
    durations: number[],
    melodyLength: number,
    amount =
        BATCH_SIZE
): TonalCombinationSequence[] {

    const result:
        TonalCombinationSequence[] =
        []


    for (
        let index = 0;
        index < amount;
        index++
    ) {

        const melody =
            generateRandomMelody(
                notes,
                durations,
                melodyLength
            )


        if (
            melody
        ) {

            result.push(
                melody
            )
        }
    }


    return result
}


export default function TonalCombinationEditor({
    notes,
    onPlaySequence
}: Props) {


    const [
        durations,
        setDurations
    ] =
        useState<number[]>(
            AVAILABLE_DURATIONS
        )


    const [
        melodyLength,
        setMelodyLength
    ] =
        useState(
            INITIAL_MELODY_LENGTH
        )


    const [
        melodies,
        setMelodies
    ] =
        useState<
            TonalCombinationSequence[]
        >(
            []
        )


    const SIZE =
        600

    const CENTER =
        SIZE / 2

    const RADIUS =
        220


    /*
        ==========================
        FIGURA GEOMÉTRICA
        ==========================

        La geometría representa
        las notas provenientes de
        TONAL SELECTION.
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


    const polygonPoints =
        points
            .map(
                point =>
                    `${point.x},${point.y}`
            )
            .join(
                " "
            )


    /*
        Si cambia:

        - la selección tonal
        - la longitud
        - los ritmos disponibles

        regeneramos las primeras 10.

        Cambiar SAMPLE no toca
        este componente.
    */

    useEffect(
        () => {

            setMelodies(
                generateBatch(
                    notes,
                    durations,
                    melodyLength
                )
            )

        },

        [
            notes,
            durations,
            melodyLength
        ]
    )


    function toggleDuration(
        duration: number
    ) {

        setDurations(
            current => {

                const exists =
                    current.includes(
                        duration
                    )


                if (
                    exists
                ) {

                    return current.filter(
                        value =>
                            value !==
                            duration
                    )
                }


                return [
                    ...current,
                    duration
                ]
            }
        )
    }


    function handleDecreaseLength() {

        setMelodyLength(
            current =>
                Math.max(
                    1,
                    current - 1
                )
        )
    }


    function handleIncreaseLength() {

        setMelodyLength(
            current =>
                current + 1
        )
    }


    function handleRegenerate() {

        setMelodies(
            generateBatch(
                notes,
                durations,
                melodyLength
            )
        )
    }


    function handleLoadMore() {

        const nextBatch =
            generateBatch(
                notes,
                durations,
                melodyLength
            )


        setMelodies(
            current => [
                ...current,
                ...nextBatch
            ]
        )
    }


    return (

        <div
            className="tonal-combination-editor"
        >

            {/*
                ==========================
                LEFT BAR
                ==========================
            */}

            <aside
                className="tonal-combination-editor__sidebar"
            >

                <div
                    className="tonal-combination-editor__title"
                >
                    TONAL COMBINATION
                </div>


                <div
                    className="tonal-combination-editor__info"
                >

                    <span>
                        SOURCE NOTES
                    </span>

                    <strong>
                        {
                            notes.length
                        }
                    </strong>


                    <span>
                        MELODY LENGTH
                    </span>

                    <strong>
                        {
                            melodyLength
                        }
                    </strong>


                    <span>
                        GENERATED
                    </span>

                    <strong>
                        {
                            melodies.length
                        }
                    </strong>

                </div>


                {/*
                    RITMOS PERMITIDOS
                */}

                <div
                    className="tonal-combination-control"
                >

                    <div
                        className="tonal-combination-control__label"
                    >
                        RHYTHMS
                    </div>


                    <div
                        className="tonal-combination-durations"
                    >

                        {
                            AVAILABLE_DURATIONS.map(
                                duration => {

                                    const active =
                                        durations.includes(
                                            duration
                                        )


                                    return (

                                        <button
                                            key={
                                                duration
                                            }

                                            className={[
                                                "tonal-duration-button",

                                                active
                                                    ? "tonal-duration-button--active"
                                                    : ""

                                            ].join(
                                                " "
                                            )}

                                            onClick={
                                                () =>
                                                    toggleDuration(
                                                        duration
                                                    )
                                            }
                                        >
                                            {
                                                duration
                                            }
                                        </button>

                                    )
                                }
                            )
                        }

                    </div>

                </div>


                {/*
                    LONGITUD DE MELODÍA
                */}

                <div
                    className="tonal-combination-control"
                >

                    <div
                        className="tonal-combination-control__label"
                    >
                        MELODY LENGTH
                    </div>


                    <div
                        className="tonal-combination-level"
                    >

                        <button
                            onClick={
                                handleDecreaseLength
                            }
                        >
                            −
                        </button>


                        <strong>
                            {
                                melodyLength
                            }
                        </strong>


                        <button
                            onClick={
                                handleIncreaseLength
                            }
                        >
                            +
                        </button>

                    </div>

                </div>


                <button
                    className="tonal-combination-regenerate"

                    onClick={
                        handleRegenerate
                    }
                >
                    ↻ REGENERATE 10
                </button>


                {/*
                    LISTA DE MELODÍAS
                */}

                <div
                    className="tonal-combination-editor__list"
                >

                    {
                        melodies.map(
                            (
                                melody,
                                index
                            ) => (

                                <div
                                    key={
                                        melody.id
                                    }

                                    className="tonal-combination-sequence"
                                >

                                    <button
                                        className="tonal-combination-sequence__play"

                                        onClick={
                                            () =>
                                                onPlaySequence(
                                                    melody
                                                )
                                        }
                                    >
                                        ▶
                                    </button>


                                    <span
                                        className="tonal-combination-sequence__index"
                                    >
                                        {
                                            index + 1
                                        }
                                    </span>


                                    <strong>
                                        {
                                            melody.events
                                                .map(
                                                    event =>
                                                        `${event.note.name}(${event.duration})`
                                                )
                                                .join(
                                                    " → "
                                                )
                                        }
                                    </strong>

                                </div>

                            )
                        )
                    }

                </div>


                {
                    notes.length >
                        0 &&
                    durations.length >
                        0 && (

                        <button
                            className="tonal-combination-load-more"

                            onClick={
                                handleLoadMore
                            }
                        >
                            + LOAD 10 MORE
                        </button>

                    )
                }


                {
                    notes.length ===
                    0 && (

                        <div
                            className="tonal-combination-empty"
                        >
                            SELECT TONAL NOTES FIRST
                        </div>

                    )
                }


                {
                    notes.length >
                        0 &&
                    durations.length ===
                        0 && (

                        <div
                            className="tonal-combination-empty"
                        >
                            ENABLE AT LEAST ONE RHYTHM
                        </div>

                    )
                }

            </aside>


            {/*
                ==========================
                FIGURA AZUL
                ==========================
            */}

            <div
                className="tonal-combination-editor__visual"
            >

                <div
                    className="tonal-combination-editor__counter"
                >
                    {
                        melodyLength
                    } NOTES / MELODY
                </div>


                <svg
                    viewBox={
                        `0 0 ${SIZE} ${SIZE}`
                    }

                    className="tonal-combination-editor__svg"
                >

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

                        className="tonal-combination-editor__ring"
                    />


                    {
                        points.length >
                        1 && (

                            <polygon
                                points={
                                    polygonPoints
                                }

                                className="tonal-combination-editor__graph"
                            />

                        )
                    }


                    {
                        points.map(
                            point => (

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
                                            9
                                        }

                                        className="tonal-combination-editor__point"
                                    />


                                    <text
                                        x={
                                            point.x
                                        }

                                        y={
                                            point.y - 22
                                        }

                                        textAnchor="middle"

                                        className="tonal-combination-editor__label"
                                    >
                                        {
                                            point.name
                                        }
                                    </text>

                                </g>

                            )
                        )
                    }


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

                        className="tonal-combination-editor__center"
                    />

                </svg>

            </div>

        </div>
    )
}