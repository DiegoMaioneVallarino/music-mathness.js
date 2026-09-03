import type {
    TonalCyclePattern
} from "../../engine/patterns/types"

import {
    createTonalCyclePositions,
    getFigureTraversal,
    getFigureStepCount,
    getFigureTurns,
    getUniquePositionCount,
    isFigureClosed,
    getFigureSteps
} from "../../engine/music/tonalCycles/tonalCycle"

import "./styles.css"


type TonalCycleEditorProps = {

    pattern:
        TonalCyclePattern

    playbackProgress:
        number

    isPlaying:
        boolean


    onFigureModeChange: (
        mode:
            "regular" |
            "irregular"
    ) => void


    onRegularStepChange: (
        step: number
    ) => void


    onFigureRotationChange: (
        rotation: number
    ) => void


    onIrregularStepChange: (
        index: number,
        step: number
    ) => void


    onAddIrregularStep:
        () => void


    onCloseLastStepChange: (
        close: boolean
    ) => void


    onSelectFigure: (
        figureId: string
    ) => void


    onAddFigure:
        () => void


    onRootChange: (
        rootMidi: number
    ) => void


    onGateChange: (
        gate: number
    ) => void


    onOctaveSpanChange: (
        octaveSpan: number
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


    return (
        `${note}${octave}`
    )
}


export default function TonalCycleEditor({

    pattern,

    playbackProgress,
    isPlaying,

    onFigureModeChange,
    onRegularStepChange,
    onFigureRotationChange,
    onIrregularStepChange,
    onAddIrregularStep,
    onCloseLastStepChange,
    onSelectFigure,
    onAddFigure,

    onRootChange,
    onGateChange,
    onOctaveSpanChange

}: TonalCycleEditorProps) {


    const SIZE =
        600


    const CENTER =
        SIZE / 2


    const RADIUS =
        240


    /*
        BASE TONAL

        7 notas
        octaveSpan = 1

        →

        14 posiciones
    */

    const tonalPositions =
        createTonalCyclePositions(
            pattern.scaleIntervals.length,
            pattern.octaveSpan
        )


    const totalPositions =
        tonalPositions.length


    /*
        FIGURA SELECCIONADA
    */

    const selectedFigure =
        pattern.figures.find(
            figure =>
                figure.id ===
                pattern.selectedFigureId
        ) ??
        pattern.figures[0]


    if (
        !selectedFigure
    ) {
        return null
    }


    /*
        RECORRIDO DE LA FIGURA
    */

    const traversal =
        getFigureTraversal(
            selectedFigure,
            totalPositions
        )


    const effectiveSteps =
        getFigureSteps(
            selectedFigure,
            totalPositions
        )


    /*
        ESTADÍSTICAS
    */

    const stepCount =
        getFigureStepCount(
            selectedFigure,
            totalPositions
        )


    const turns =
        getFigureTurns(
            selectedFigure,
            totalPositions
        )


    const uniquePositions =
        getUniquePositionCount(
            selectedFigure,
            totalPositions
        )


    const closed =
        isFigureClosed(
            selectedFigure,
            totalPositions
        )


    /*
        OPCIONES REGULARES

        Por ahora mantenemos
        exactamente nuestra definición:

        REGULAR =
        salto que divide exactamente
        la base tonal.

        BASE 14:

        2
        7

        No mostramos 1 ni 14
        porque serían los casos
        triviales.
    */

    const regularOptions =
        Array
            .from(
                {
                    length:
                        Math.max(
                            0,
                            totalPositions - 1
                        )
                },
                (
                    _,
                    index
                ) =>
                    index + 1
            )
            .filter(
                step =>
                    step > 1 &&
                    step < totalPositions &&
                    totalPositions % step === 0
            )


    /*
        Convertimos cada posición
        tonal en coordenada SVG.
    */

    const points =
        tonalPositions.map(
            (
                position,
                index
            ) => {

                const angle =
                    -Math.PI / 2 +
                    (
                        index /
                        totalPositions
                    ) *
                    Math.PI *
                    2


                const x =
                    CENTER +
                    Math.cos(
                        angle
                    ) *
                    RADIUS


                const y =
                    CENTER +
                    Math.sin(
                        angle
                    ) *
                    RADIUS


                const interval =
                    pattern.scaleIntervals[
                        position.degree
                    ]


                const midi =
                    pattern.rootMidi +
                    interval +
                    position.octaveOffset *
                    12


                return {

                    index,

                    degree:
                        position.degree,

                    octaveOffset:
                        position.octaveOffset,

                    midi,

                    name:
                        midiToName(
                            midi
                        ),

                    x,

                    y
                }
            }
        )


    /*
        Puntos visitados
        por la figura.
    */

    const traversalPoints =
        traversal
            .map(
                index =>
                    points[
                        index
                    ]
            )
            .filter(
                point =>
                    point !==
                    undefined
            )


    /*
        NOTA ACTUAL
    */

    const activeTraversalIndex =
        traversalPoints.length > 0

            ? Math.min(

                traversalPoints.length - 1,

                Math.floor(
                    playbackProgress *
                    traversalPoints.length
                )
            )

            : 0


    const activePoint =
        traversalPoints[
            activeTraversalIndex
        ]


    /*
        POLÍGONO PRINCIPAL
    */

    const polygonPoints =
        traversalPoints
            .map(
                point =>
                    `${point.x},${point.y}`
            )
            .join(
                " "
            )


    /*
        Texto de vueltas.

        Evitamos mostrar:

        1.0000000000
    */

    const turnsLabel =
        Number.isInteger(
            turns
        )
            ? String(
                turns
            )
            : turns.toFixed(
                2
            )


    return (

        <section
            className="tonal-cycle-editor"
        >


            {/*
                HEADER GENERAL
            */}

            <header
                className="tonal-cycle-editor__header"
            >

                <span>
                    {
                        pattern.name
                    }
                </span>


                <span>
                    {
                        totalPositions
                    } TONAL POSITIONS
                </span>

            </header>


            {/*
                MINI MENÚ
                DE FIGURAS
            */}

            <div
                className="tonal-figure-tabs"
            >

                {
                    pattern.figures.map(
                        (
                            figure,
                            index
                        ) => (

                            <button

                                key={
                                    figure.id
                                }

                                className={[
                                    "tonal-figure-tab",

                                    figure.id ===
                                    selectedFigure.id
                                        ? "tonal-figure-tab--active"
                                        : ""
                                ].join(
                                    " "
                                )}

                                onClick={
                                    () =>
                                        onSelectFigure(
                                            figure.id
                                        )
                                }

                                title={
                                    figure.name
                                }
                            >

                                <span>
                                    {
                                        index + 1
                                    }
                                </span>

                                <span>
                                    {
                                        figure.mode ===
                                        "regular"
                                            ? "◇"
                                            : "✦"
                                    }
                                </span>

                            </button>

                        )
                    )
                }


                <button

                    className="
                        tonal-figure-tab
                        tonal-figure-tab--add
                    "

                    onClick={
                        onAddFigure
                    }
                >
                    +
                </button>

            </div>


            <div
                className="tonal-cycle-editor__content"
            >


                {/*
                    CONTROLES
                */}

                <aside
                    className="tonal-cycle-controls"
                >


                    <div
                        className="tonal-cycle-figure-name"
                    >

                        {
                            selectedFigure.name
                        }

                    </div>


                    {/*
                        MODE

                        IRREGULAR
                        REGULAR
                    */}

                    <div
                        className="tonal-cycle-mode"
                    >

                        <button

                            className={[
                                "tonal-mode-button",

                                selectedFigure.mode ===
                                "irregular"
                                    ? "tonal-mode-button--active"
                                    : ""
                            ].join(
                                " "
                            )}

                            onClick={
                                () =>
                                    onFigureModeChange(
                                        "irregular"
                                    )
                            }
                        >
                            IRREGULAR
                        </button>


                        <button

                            className={[
                                "tonal-mode-button",

                                selectedFigure.mode ===
                                "regular"
                                    ? "tonal-mode-button--active"
                                    : ""
                            ].join(
                                " "
                            )}

                            onClick={
                                () =>
                                    onFigureModeChange(
                                        "regular"
                                    )
                            }
                        >
                            REGULAR
                        </button>

                    </div>


                    {/*
                        REGULAR
                    */}

                    {
                        selectedFigure.mode ===
                        "regular" && (

                            <div
                                className="tonal-regular-control"
                            >

                                <span
                                    className="
                                        tonal-number-control__label
                                    "
                                >
                                    STEP SIZE
                                </span>


                                <div
                                    className="
                                        tonal-regular-options
                                    "
                                >

                                    {
                                        regularOptions.map(
                                            option => (

                                                <button

                                                    key={
                                                        option
                                                    }

                                                    className={[
                                                        "tonal-regular-option",

                                                        selectedFigure.regularStep ===
                                                        option
                                                            ? "tonal-regular-option--active"
                                                            : ""
                                                    ].join(
                                                        " "
                                                    )}

                                                    onClick={
                                                        () =>
                                                            onRegularStepChange(
                                                                option
                                                            )
                                                    }
                                                >

                                                    {
                                                        option
                                                    }

                                                </button>

                                            )
                                        )
                                    }

                                </div>


                                {
                                    regularOptions.length ===
                                    0 && (

                                        <span>
                                            NO REGULAR FACTORS
                                        </span>

                                    )
                                }

                            </div>

                        )
                    }


                    {/*
                        IRREGULAR
                    */}

                    {
                        selectedFigure.mode ===
                        "irregular" && (

                            <div
                                className="
                                    tonal-irregular-control
                                "
                            >

                                <div
                                    className="
                                        tonal-irregular-header
                                    "
                                >

                                    <span
                                        className="
                                            tonal-number-control__label
                                        "
                                    >
                                        STEP SIZE
                                    </span>


                                    <button

                                        className="
                                            tonal-add-step
                                        "

                                        onClick={
                                            onAddIrregularStep
                                        }
                                    >
                                        + NEW STEP
                                    </button>

                                </div>


                                <div
                                    className="
                                        tonal-irregular-list
                                    "
                                >

                                    {
                                        selectedFigure.steps.map(
                                            (
                                                step,
                                                index
                                            ) => {


                                                const isLast =
                                                    index ===
                                                    selectedFigure.steps.length -
                                                    1


                                                const isClose =
                                                    isLast &&
                                                    selectedFigure.closeLastStep


                                                const displayedStep =
                                                    isClose
                                                        ? effectiveSteps[
                                                            index
                                                        ] ??
                                                        step
                                                        : step


                                                return (

                                                    <div

                                                        key={
                                                            index
                                                        }

                                                        className={[
                                                            "tonal-irregular-step",

                                                            isClose
                                                                ? "tonal-irregular-step--close"
                                                                : ""
                                                        ].join(
                                                            " "
                                                        )}
                                                    >


                                                        <button

                                                            disabled={
                                                                isClose
                                                            }

                                                            onClick={
                                                                () =>
                                                                    onIrregularStepChange(
                                                                        index,

                                                                        Math.max(
                                                                            1,
                                                                            step -
                                                                            1
                                                                        )
                                                                    )
                                                            }
                                                        >
                                                            −
                                                        </button>


                                                        <strong>
                                                            {
                                                                displayedStep
                                                            }
                                                        </strong>


                                                        <button

                                                            disabled={
                                                                isClose
                                                            }

                                                            onClick={
                                                                () =>
                                                                    onIrregularStepChange(
                                                                        index,
                                                                        step +
                                                                        1
                                                                    )
                                                            }
                                                        >
                                                            +
                                                        </button>


                                                        {
                                                            isLast && (

                                                                <button

                                                                    className={[
                                                                        "tonal-close-button",

                                                                        selectedFigure.closeLastStep
                                                                            ? "tonal-close-button--active"
                                                                            : ""
                                                                    ].join(
                                                                        " "
                                                                    )}

                                                                    onClick={
                                                                        () =>
                                                                            onCloseLastStepChange(
                                                                                !selectedFigure.closeLastStep
                                                                            )
                                                                    }
                                                                >
                                                                    CLOSE
                                                                </button>

                                                            )
                                                        }

                                                    </div>

                                                )
                                            }
                                        )
                                    }

                                </div>

                            </div>

                        )
                    }


                    {/*
                        ESTADÍSTICAS
                    */}

                    <div
                        className="tonal-cycle-info"
                    >

                        <span>
                            STEPS
                        </span>

                        <strong>
                            {
                                stepCount
                            }
                        </strong>


                        <span>
                            TURNS
                        </span>

                        <strong>
                            {
                                turnsLabel
                            }
                        </strong>


                        <span>
                            POSITIONS
                        </span>

                        <strong>
                            {
                                uniquePositions
                            }
                            /
                            {
                                totalPositions
                            }
                        </strong>


                        <span>
                            STATUS
                        </span>

                        <strong>
                            {
                                closed
                                    ? "CLOSED"
                                    : "OPEN"
                            }
                        </strong>

                    </div>


                    {/*
                        GATE
                    */}

                    <div
                        className="tonal-gate-control"
                    >

                        <div
                            className="
                                tonal-gate-control__header
                            "
                        >

                            <span>
                                GATE
                            </span>


                            <span>
                                {
                                    pattern.gate.toFixed(
                                        2
                                    )
                                }
                            </span>

                        </div>


                        <input

                            type="range"

                            min={
                                0.05
                            }

                            max={
                                2
                            }

                            step={
                                0.05
                            }

                            value={
                                pattern.gate
                            }

                            onChange={
                                event =>
                                    onGateChange(
                                        Number(
                                            event.target.value
                                        )
                                    )
                            }
                        />

                    </div>

                </aside>


                {/*
                    VISUAL
                */}

                <div
                    className="tonal-cycle-visual"
                >


                    {/*
                        BASE SPAN
                    */}

                    <div
                        className="
                            tonal-cycle-floating-control
                            tonal-cycle-floating-control--base
                        "
                    >

                        <span>
                            BASE SPAN
                        </span>


                        <div>

                            <button
                                onClick={
                                    () =>
                                        onOctaveSpanChange(
                                            Math.max(
                                                1,
                                                pattern.octaveSpan -
                                                1
                                            )
                                        )
                                }
                            >
                                −
                            </button>


                            <strong>
                                {
                                    pattern.octaveSpan
                                }
                            </strong>


                            <button
                                onClick={
                                    () =>
                                        onOctaveSpanChange(
                                            pattern.octaveSpan +
                                            1
                                        )
                                }
                            >
                                +
                            </button>

                        </div>


                        <small>
                            {
                                totalPositions
                            } POSITIONS
                        </small>

                    </div>


                    {/*
                        OCTAVE
                    */}

                    <div
                        className="
                            tonal-cycle-floating-control
                            tonal-cycle-floating-control--octave
                        "
                    >

                        <span>
                            OCTAVE
                        </span>


                        <div>

                            <button
                                onClick={
                                    () =>
                                        onRootChange(
                                            pattern.rootMidi -
                                            12
                                        )
                                }
                            >
                                −
                            </button>


                            <strong>

                                {
                                    Math.floor(
                                        pattern.rootMidi /
                                        12
                                    ) - 1
                                }

                            </strong>


                            <button
                                onClick={
                                    () =>
                                        onRootChange(
                                            pattern.rootMidi +
                                            12
                                        )
                                }
                            >
                                +
                            </button>

                        </div>

                    </div>


                    <svg

                        viewBox={
                            `0 0 ${SIZE} ${SIZE}`
                        }

                        className="
                            tonal-cycle-svg
                        "
                    >


                        {/*
                            CÍRCULO BASE
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

                            className="
                                tonal-cycle-boundary
                            "
                        />


                        {/*
                            FIGURA
                        */}

                        {
                            traversalPoints.length >
                            1 && (

                                <polygon

                                    points={
                                        polygonPoints
                                    }

                                    className="
                                        tonal-cycle-shape
                                    "
                                />

                            )
                        }


                        {/*
                            MANECILLA
                        */}

                        {
                            isPlaying &&
                            activePoint && (

                                <line

                                    x1={
                                        CENTER
                                    }

                                    y1={
                                        CENTER
                                    }

                                    x2={
                                        activePoint.x
                                    }

                                    y2={
                                        activePoint.y
                                    }

                                    className="
                                        tonal-cycle-playhead
                                    "
                                />

                            )
                        }


                        {/*
                            POSICIONES TONALES
                        */}

                        {
                            points.map(
                                point => {


                                    const active =
                                        traversal.includes(
                                            point.index
                                        )


                                    const playing =
                                        isPlaying &&
                                        activePoint?.index ===
                                        point.index


                                    return (

                                        <g
                                            key={
                                                point.index
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
                                                        ? 8
                                                        : 5
                                                }

                                                className={[
                                                    "tonal-point",

                                                    active
                                                        ? "tonal-point--active"
                                                        : "",

                                                    playing
                                                        ? "tonal-point--playing"
                                                        : ""
                                                ].join(
                                                    " "
                                                )}
                                            />


                                            {
                                                playing && (

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

                                                        className="
                                                            tonal-point-pulse
                                                        "
                                                    />

                                                )
                                            }


                                           <text

    x={
        point.x
    }

    y={
        point.y
    }

    className="tonal-point-label"

    textAnchor="middle"

    dominantBaseline="middle"
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

                            className="
                                tonal-cycle-center
                            "
                        />

                    </svg>


                    {/*
                        ROTATION

                        Ahora pertenece
                        a la figura,
                        no al pattern.
                    */}

                    <div
                        className="
                            tonal-cycle-rotation
                        "
                    >

                        <span>
                            ROTATION
                        </span>


                        <div>

                            <button
                                onClick={
                                    () =>
                                        onFigureRotationChange(
                                            selectedFigure.rotation -
                                            1
                                        )
                                }
                            >
                                −
                            </button>


                            <strong>
                                {
                                    selectedFigure.rotation
                                }
                            </strong>


                            <button
                                onClick={
                                    () =>
                                        onFigureRotationChange(
                                            selectedFigure.rotation +
                                            1
                                        )
                                }
                            >
                                +
                            </button>

                        </div>

                    </div>


                </div>


            </div>


        </section>
    )
}