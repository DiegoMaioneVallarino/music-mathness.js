import type {
    TonalCyclePattern,
    TonalFigure
} from "./types"


export function createTonalCyclePattern(
    name: string,
    color: string,
    rootMidi = 60,
    cycleBeats = 8
): TonalCyclePattern {

    const firstFigure:
        TonalFigure = {

        id:
            crypto.randomUUID(),

        name:
            "Figure 1",

        mode:
            "regular",

        regularStep:
            2,

        steps: [
            2
        ],

        closeLastStep:
            false,

        rotation:
            0
    }


    return {

        id:
            crypto.randomUUID(),

        type:
            "tonal-cycle",

        name,

        color,

        rootMidi,

        scaleIntervals: [
            0,
            2,
            4,
            5,
            7,
            9,
            11
        ],

        octaveSpan:
            1,

        figures: [
            firstFigure
        ],

        selectedFigureId:
            firstFigure.id,

        cycleBeats,

        gate:
            0.8
    }
}