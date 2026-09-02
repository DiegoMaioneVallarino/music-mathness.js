import type {
    CyclePattern
} from "../../engine/patterns/types"
import {
    getCycleAngles,
    getCycleEventProgresses
} from "../../engine/patterns/cycle"

import "./styles.css"
import {
    useEffect,
    useRef,
    useState
} from "react"



type CycleEditorProps = {

    pattern:
        CyclePattern

    playbackProgress:
        number

    isPlaying:
        boolean

    onDivisionChange: (
        layerId: string,
        division: number
    ) => void

    onPhaseChange: (
        layerId: string,
        phase: number
    ) => void
}

type CyclePulse = {

    id: string

    layerId: string

    pointIndex: number

    x: number

    y: number
}
export default function CycleEditor({
    pattern,
    playbackProgress,
    isPlaying,
    onDivisionChange,
    onPhaseChange
}: CycleEditorProps) {

    const SIZE =
        500

    const CENTER =
        SIZE / 2

const PLAYHEAD_RADIUS =
    215


const playheadAngle =
    playbackProgress *
    Math.PI *
    2 -
    Math.PI / 2


const playheadX =
    CENTER +
    Math.cos(
        playheadAngle
    ) *
    PLAYHEAD_RADIUS


const playheadY =
    CENTER +
    Math.sin(
        playheadAngle
    ) *
    PLAYHEAD_RADIUS

const [
    pulses,
    setPulses
] = useState<CyclePulse[]>(
    []
)


const previousProgressRef =
    useRef(
        playbackProgress
    )

useEffect(() => {

    if (!isPlaying) {

        previousProgressRef.current =
            playbackProgress

        return
    }


    const previous =
        previousProgressRef.current


    const current =
        playbackProgress


    /*
        El ciclo puede pasar:

        .98 → .01

        por eso tenemos que considerar
        el wrap-around.
    */

    function crossed(
        eventProgress: number
    ): boolean {

        if (
            current >= previous
        ) {

            return (
                eventProgress >
                    previous &&
                eventProgress <=
                    current
            )
        }


        /*
            Pasamos por el final
            y volvimos a cero.
        */

        return (
            eventProgress >
                previous ||
            eventProgress <=
                current
        )
    }


    const newPulses:
        CyclePulse[] = []


    pattern.layers.forEach(
        (
            layer,
            layerIndex
        ) => {

            const radius =
                Math.min(
                    80 +
                        layerIndex *
                            48,
                    205
                )


            const angles =
                getCycleAngles(
                    layer.division,
                    layer.phase
                )


            const progresses =
                getCycleEventProgresses(
                    layer.division,
                    layer.phase
                )


            progresses.forEach(
                (
                    eventProgress,
                    pointIndex
                ) => {

                    if (
                        !crossed(
                            eventProgress
                        )
                    ) {
                        return
                    }


                    const angle =
                        angles[
                            pointIndex
                        ] -
                        Math.PI / 2


                    const x =
                        CENTER +
                        Math.cos(
                            angle
                        ) *
                            radius


                    const y =
                        CENTER +
                        Math.sin(
                            angle
                        ) *
                            radius


                    newPulses.push({

                        id:
                            crypto.randomUUID(),

                        layerId:
                            layer.id,

                        pointIndex,

                        x,

                        y
                    })
                }
            )
        }
    )


    if (
        newPulses.length >
        0
    ) {

        setPulses(
            currentPulses => [
                ...currentPulses,
                ...newPulses
            ]
        )
    }


    previousProgressRef.current =
        current

}, [
    playbackProgress,
    isPlaying,
    pattern
])

    return (

        <section className="cycle-editor">


            <header className="cycle-editor__header">

                <span>
                    {pattern.name}
                </span>

                <span>
                    {pattern.cycleBeats} BEATS
                </span>

            </header>


            <div className="cycle-editor__content">


                {/* CONTROLES IZQUIERDOS */}

                <div className="cycle-editor__layers">


                    {pattern.layers.map(
                        layer => (

                            <div
                                className="cycle-layer-control"
                                key={
                                    layer.id
                                }
                            >


                                <div className="cycle-layer-control__name">

                                    <span className="cycle-layer-control__sample-icon">
                                        ♫
                                    </span>

                                    {
                                        layer.name
                                    }

                                </div>


                                {/* DIVISION */}

                                <div className="division-control">


                                    <span className="division-control__label">
                                        DIVISION
                                    </span>


                                    <div className="division-control__value">


                                        <button
                                            className="division-control__button division-control__button--minus"

                                            onClick={() =>
                                                onDivisionChange(
                                                    layer.id,
                                                    Math.max(
                                                        1,
                                                        layer.division -
                                                            1
                                                    )
                                                )
                                            }
                                        >
                                            −
                                        </button>


                                        <span className="division-control__number">

                                            {
                                                layer.division
                                            }

                                        </span>


                                        <button
                                            className="division-control__button division-control__button--plus"

                                            onClick={() =>
                                                onDivisionChange(
                                                    layer.id,
                                                    layer.division +
                                                        1
                                                )
                                            }
                                        >
                                            +
                                        </button>


                                    </div>


                                </div>


                                {/* PHASE */}

                                <div className="phase-control">


                                    <div className="phase-control__header">

                                        <span>
                                            PHASE
                                        </span>

                                        <span>
                                            {
                                                layer.phase.toFixed(
                                                    2
                                                )
                                            }
                                        </span>

                                    </div>


                                    <input
                                        type="range"

                                        min={0}
                                        max={1}
                                        step={0.01}

                                        value={
                                            layer.phase
                                        }

                                        onChange={
                                            event =>
                                                onPhaseChange(
                                                    layer.id,
                                                    Number(
                                                        event.target.value
                                                    )
                                                )
                                        }
                                    />


                                </div>


                            </div>

                        )
                    )}


                    {
                        pattern.layers.length ===
                        0 && (

                            <div className="cycle-editor__empty">

                                ADD A SAMPLE
                                <br />

                                FROM THE FILE LIBRARY

                            </div>

                        )
                    }


                </div>


                {/* GEOMETRÍA */}

                <div className="cycle-editor__visual">


                    <svg
                        viewBox={`0 0 ${SIZE} ${SIZE}`}

                        className="cycle-svg"
                    >


                        <circle
                            cx={
                                CENTER
                            }

                            cy={
                                CENTER
                            }

                            r={215}

                            className="cycle-boundary"
                        />


                        {pattern.layers.map(
                            (
                                layer,
                                layerIndex
                            ) => {

                                /*
                                    Distribuimos los polígonos
                                    desde dentro hacia fuera.
                                */

                                const radius =
                                    Math.min(
                                        80 +
                                            layerIndex *
                                                48,
                                        205
                                    )


                                const angles =
                                    getCycleAngles(
                                        layer.division,
                                        layer.phase
                                    )


                                const points =
                                    angles.map(
                                        angle => {

                                            const adjustedAngle =
                                                angle -
                                                Math.PI /
                                                    2


                                            return {

                                                x:
                                                    CENTER +
                                                    Math.cos(
                                                        adjustedAngle
                                                    ) *
                                                        radius,

                                                y:
                                                    CENTER +
                                                    Math.sin(
                                                        adjustedAngle
                                                    ) *
                                                        radius
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


                                return (

                                    <g
                                        key={
                                            layer.id
                                        }
                                    >


                                        <circle
                                            cx={
                                                CENTER
                                            }

                                            cy={
                                                CENTER
                                            }

                                            r={
                                                radius
                                            }

                                            className="cycle-orbit"
                                        />


                                        {
                                            layer.division >=
                                                2 && (

                                                <polygon
                                                    points={
                                                        polygonPoints
                                                    }

                                                    className="cycle-polygon"
                                                />

                                            )
                                        }


                                        {points.map(
                                            (
                                                point,
                                                pointIndex
                                            ) => (

                                                <circle
                                                    key={
                                                        pointIndex
                                                    }

                                                    cx={
                                                        point.x
                                                    }

                                                    cy={
                                                        point.y
                                                    }

                                                    r={6}

                                                    className="cycle-event"
                                                />

                                            )
                                        )}


                                    </g>

                                )
                            }
                        )}
{pulses.map(
    pulse => (

        <circle
            key={
                pulse.id
            }

            cx={
                pulse.x
            }

            cy={
                pulse.y
            }

            r={6}

            className="cycle-hit-pulse"

            onAnimationEnd={() => {

                setPulses(
                    currentPulses =>
                        currentPulses.filter(
                            current =>
                                current.id !==
                                pulse.id
                        )
                )
            }}
        />

    )
)}
                        {isPlaying && (

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

                            className="cycle-playhead"
                        />

                    )}
                        <circle
                            cx={
                                CENTER
                            }

                            cy={
                                CENTER
                            }

                            r={4}

                            className="cycle-center"
                        />


                    </svg>


                </div>


            </div>


        </section>
    )
}