export type Step =
    0 |
    1


export type PatternLayer = {

    id: string

    name: string

    sampleId:
        string |
        null

    mode:
        "sample" |
        "melodic"

    steps:
        Step[]
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

    type:
        "step"

    name: string

    color: string

    bars: number

    resolution: number

    layers:
        PatternLayer[]
}


export type PianoPattern = {

    id: string

    type:
        "piano"

    name: string

    color: string

    bars: number

    resolution: number

    notes:
        PianoNote[]
}


/*
    CYCLE RHYTHM
*/

export type CycleLayer = {

    id: string

    name: string

    sampleId:
        string |
        null

    division: number

    phase: number
}


export type CyclePattern = {

    id: string

    type:
        "cycle"

    name: string

    color: string

    cycleBeats: number

    layers:
        CycleLayer[]
}


/*
    TONAL FIGURES
*/

export type TonalFigureMode =
    "regular" |
    "irregular"


export type TonalFigure = {

    id: string

    name: string


    /*
        REGULAR

        Todos los saltos
        tienen el mismo tamaño.

        Ejemplo:

        BASE 14

        regularStep = 2

        0
        2
        4
        6
        8
        10
        12
        0
    */

    mode:
        TonalFigureMode


    regularStep:
        number


    /*
        IRREGULAR

        Cada valor representa
        un salto diferente.

        Ejemplo:

        [1, 2, 4, 4, 2, 1]
    */

    steps:
        number[]


    /*
        Si está activado,
        el último step
        deja de ser manual.

        El engine calcula
        automáticamente el salto
        necesario para cerrar
        la figura dentro del módulo.
    */

    closeLastStep:
        boolean


    /*
        Rotación discreta
        de ESTA figura
        sobre la base tonal.
    */

    rotation:
        number
}


/*
    TONAL CYCLE
*/

export type TonalCyclePattern = {

    id: string

    type:
        "tonal-cycle"

    name: string

    color: string


    /*
        C4 = MIDI 60
    */

    rootMidi:
        number


    /*
        Ejemplo:

        C Major

        C  D  E  F  G  A  B

        0  2  4  5  7  9  11
    */

    scaleIntervals:
        number[]


    /*
        Cantidad de octavas
        que recorre la base
        antes de reflejarse.

        Para una escala
        de 7 grados:

        1 → 14 posiciones
        2 → 28 posiciones
        3 → 42 posiciones
        4 → 56 posiciones
    */

    octaveSpan:
        number


    /*
        Un Tonal Cycle
        puede contener
        varias figuras.
    */

    figures:
        TonalFigure[]


    /*
        Figura actualmente
        seleccionada
        en el mini menú superior.
    */

    selectedFigureId:
        string


    /*
        Duración temporal
        del ciclo completo
        en beats.
    */

    cycleBeats:
        number


    /*
        Duración relativa
        de las notas.

        1 = ocupa todo
        el intervalo temporal.

        < 1 = más corta
        > 1 = se solapa
    */

    gate:
        number
}


/*
    UNION GENERAL
*/

export type Pattern =
    StepPattern |
    PianoPattern |
    CyclePattern |
    TonalCyclePattern