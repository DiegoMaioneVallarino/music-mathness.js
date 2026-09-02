import type {
    TonalCyclePattern
} from "../../engine/patterns/types"

import {
    createTonalCyclePositions,
    getTonalTraversal
} from "../../engine/music/tonalCycles/tonalCycle"


import "./styles.css"


type TonalCycleEditorProps = {

    pattern:
        TonalCyclePattern
playbackProgress: number
isPlaying: boolean
    onModeChange: (
        mode:
            "divide" |
            "step"
    ) => void

    onAmountChange: (
        amount: number
    ) => void

    onRotationChange: (
        rotation: number
    ) => void

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
    onModeChange,
    onAmountChange,
    onRotationChange,
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
        0 1 2 3 4 5 6 5 4 3 2 1
    */

    const tonalPositions =
    createTonalCyclePositions(
        pattern.scaleIntervals.length,
        pattern.octaveSpan
    )

const totalPositions =
    tonalPositions.length


    const traversal =
        getTonalTraversal(
            pattern.traversalMode,
            totalPositions,
            pattern.amount,
            pattern.rotation
        )


    /*
        Convertimos cada posición
        del círculo en una coordenada.
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
                Math.cos(angle) *
                    RADIUS

            const y =
                CENTER +
                Math.sin(angle) *
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
                    midiToName(midi),
                x,
                y
            }
        }
    )


    /*
        Los puntos que la figura
        realmente visita.
    */

  const traversalPoints =
    traversal
        .map(
            index =>
                points[index]
        )
        .filter(
            point =>
                point !== undefined
        )

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


    const polygonPoints =
        traversalPoints
            .map(
                point =>
                    `${point.x},${point.y}`
            )
            .join(" ")


    return (

        <section className="tonal-cycle-editor">


            <header className="tonal-cycle-editor__header">

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


            <div className="tonal-cycle-editor__content">


                <aside className="tonal-cycle-controls">


                    <div className="tonal-cycle-mode">


                        <button
                            className={
                                pattern.traversalMode ===
                                "divide"

                                    ? "tonal-mode-button tonal-mode-button--active"

                                    : "tonal-mode-button"
                            }

                            onClick={() =>
                                onModeChange(
                                    "divide"
                                )
                            }
                        >
                            DIVIDE
                        </button>


                        <button
                            className={
                                pattern.traversalMode ===
                                "step"

                                    ? "tonal-mode-button tonal-mode-button--active"

                                    : "tonal-mode-button"
                            }

                            onClick={() =>
                                onModeChange(
                                    "step"
                                )
                            }
                        >
                            STEP
                        </button>


                    </div>


                    <div className="tonal-number-control">

                        <span className="tonal-number-control__label">

                            {
                                pattern.traversalMode ===
                                "divide"

                                    ? "DIVISIONS"

                                    : "STEP SIZE"
                            }

                        </span>


                        <div className="tonal-number-control__value">


                            <button
                                onClick={() =>
                                    onAmountChange(
                                        Math.max(
                                            1,
                                            pattern.amount -
                                                1
                                        )
                                    )
                                }
                            >
                                −
                            </button>


                            <strong>
                                {
                                    pattern.amount
                                }
                            </strong>


                            <button
                                onClick={() =>
                                    onAmountChange(
                                        pattern.amount +
                                            1
                                    )
                                }
                            >
                                +
                            </button>


                        </div>

                    </div>
<div className="tonal-number-control">

    <span className="tonal-number-control__label">
        BASE SPAN
    </span>

    <div className="tonal-number-control__value">

        <button
            onClick={() =>
                onOctaveSpanChange(
                    Math.max(
                        1,
                        pattern.octaveSpan - 1
                    )
                )
            }
        >
            −
        </button>

        <strong>
            {pattern.octaveSpan}
        </strong>

        <button
            onClick={() =>
                onOctaveSpanChange(
                    pattern.octaveSpan + 1
                )
            }
        >
            +
        </button>

    </div>

    <div className="tonal-base-size">
        {totalPositions} POSITIONS
    </div>

</div>

                    <div className="tonal-number-control">

                        <span className="tonal-number-control__label">

                            ROTATION

                        </span>


                        <div className="tonal-number-control__value">


                            <button
                                onClick={() =>
                                    onRotationChange(
                                        pattern.rotation -
                                            1
                                    )
                                }
                            >
                                −
                            </button>


                            <strong>
                                {
                                    pattern.rotation
                                }
                            </strong>


                            <button
                                onClick={() =>
                                    onRotationChange(
                                        pattern.rotation +
                                            1
                                    )
                                }
                            >
                                +
                            </button>


                        </div>

                    </div>

                    <div className="tonal-number-control">

    <span className="tonal-number-control__label">
        OCTAVE
    </span>

    <div className="tonal-number-control__value">

        <button
            onClick={() =>
                onRootChange(
                    pattern.rootMidi - 12
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
            onClick={() =>
                onRootChange(
                    pattern.rootMidi + 12
                )
            }
        >
            +
        </button>

    </div>

</div>

<div className="tonal-gate-control">

    <div className="tonal-gate-control__header">

        <span>
            GATE
        </span>

        <span>
            {
                pattern.gate.toFixed(2)
            }
        </span>

    </div>

    <input
        type="range"

        min={0.05}

        max={2}

        step={0.05}

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


                    <div className="tonal-cycle-info">

                        <span>
                            MODE
                        </span>

                        <strong>
                            {
                                pattern.traversalMode.toUpperCase()
                            }
                        </strong>


                        <span>
                            VERTICES VISITED
                        </span>

                        <strong>
                            {
                                traversal.length
                            }
                        </strong>

                    </div>


                </aside>


                <div className="tonal-cycle-visual">


                    <svg
                        viewBox={`0 0 ${SIZE} ${SIZE}`}
                        className="tonal-cycle-svg"
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

                            className="tonal-cycle-boundary"
                        />


                        {
                            traversalPoints.length >
                                1 && (

                                <polygon
                                    points={
                                        polygonPoints
                                    }

                                    className="tonal-cycle-shape"
                                />

                            )
                        }

                        {isPlaying && activePoint && (

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

        className="tonal-cycle-playhead"
    />

)}


                        {points.map(
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
].join(" ")}
                                        />

                                        {playing && (

    <circle
        cx={
            point.x
        }

        cy={
            point.y
        }

        r={9}

        className="tonal-point-pulse"
    />

)}


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
                        )}


                        <circle
                            cx={
                                CENTER
                            }

                            cy={
                                CENTER
                            }

                            r={4}

                            className="tonal-cycle-center"
                        />


                    </svg>


                </div>


            </div>


        </section>
    )
}