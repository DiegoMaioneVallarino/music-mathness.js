export function normalizePhase(
    phase: number
): number {

    return (
        (phase % 1) +
        1
    ) % 1
}


export function getCycleEventTimes(
    cycleBeats: number,
    division: number,
    phase = 0
): number[] {

    if (
        division <= 0 ||
        cycleBeats <= 0
    ) {
        return []
    }


    const normalizedPhase =
        normalizePhase(
            phase
        )


    const spacing =
        cycleBeats /
        division


    return Array.from(
        {
            length:
                division
        },

        (_, index) => {

            const time =
                (
                    index +
                    normalizedPhase
                ) *
                spacing


            return (
                time %
                cycleBeats
            )
        }
    )
}

export function getCycleEventProgresses(
    division: number,
    phase = 0
): number[] {

    if (
        division <= 0
    ) {
        return []
    }


    const normalizedPhase =
        normalizePhase(
            phase
        )


    return Array.from(
        {
            length:
                division
        },

        (_, index) =>
            (
                index +
                normalizedPhase
            ) /
            division
    ).map(
        progress =>
            progress % 1
    )
}


export function getCycleAngles(
    division: number,
    phase = 0
): number[] {

    if (
        division <= 0
    ) {
        return []
    }


    const normalizedPhase =
        normalizePhase(
            phase
        )


    return Array.from(
        {
            length:
                division
        },

        (_, index) => {

            return (
                (
                    index +
                    normalizedPhase
                ) /
                division
            ) *
            Math.PI *
            2
        }
    )
}