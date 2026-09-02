export type TonalTraversalMode =
    "divide" |
    "step"


export function createReflectedScaleDegrees(
    scaleSize: number
): number[] {

    if (scaleSize <= 1) {
        return [0]
    }


    const ascending =
        Array.from(
            {
                length:
                    scaleSize
            },
            (_, index) =>
                index
        )


    const descending =
        Array.from(
            {
                length:
                    scaleSize - 2
            },
            (_, index) =>
                scaleSize -
                2 -
                index
        )


    return [
        ...ascending,
        ...descending
    ]
}