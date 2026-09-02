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
    CyclePattern

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