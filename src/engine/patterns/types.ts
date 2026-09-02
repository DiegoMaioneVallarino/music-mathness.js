export type Step = 0 | 1


export type PatternLayer = {

    id: string

    name: string

    sampleId: string | null

    mode:
        "sample" |
        "melodic"

    steps: Step[]
}


export type PianoNote = {

    id: string

    midi: number

    startStep: number

    lengthSteps: number

    velocity: number
}


export type StepPattern = {

    id: string

    type: "step"

    name: string

    color: string

    bars: number

    resolution: number

    layers: PatternLayer[]
}


export type PianoPattern = {

    id: string

    type: "piano"

    name: string

    color: string

    bars: number

    resolution: number

    notes: PianoNote[]
}


export type Pattern =
    StepPattern |
    PianoPattern |
    CyclePattern |
    TonalCyclePattern

    export type CycleLayer = {
    id: string

    name: string

    sampleId: string | null

    division: number

    phase: number
}

export type CyclePattern = {
    id: string

    type: "cycle"

    name: string

    color: string

    cycleBeats: number

    layers: CycleLayer[]
}

export type TonalTraversalMode =
    "divide" |
    "step"


export type TonalCyclePattern = {

    id: string

    type:
        "tonal-cycle"

    name: string

    color: string


    /*
        Por ahora:
        C4 = 60
    */

    rootMidi: number


    /*
        Major:

        C D E F G A B
        0 2 4 5 7 9 11
    */

    scaleIntervals:
        number[]


    /*
        1 → 12 puntos
        2 → 24
        3 → 36
        ...
    */

    octaveSpan: number


    traversalMode:
        TonalTraversalMode


    /*
        DIVIDE:
        cantidad de partes

        STEP:
        tamaño del salto
    */

    amount:
        number


    /*
        Rotación discreta
        en posiciones tonales.
    */

    rotation:
        number


    cycleBeats:
        number

    gate: number
}