export type TonalTraversalMode =
    "divide" |
    "step"


export type TonalCyclePosition = {
    degree: number
    octaveOffset: number
}


/*
    Construye el espacio tonal completo.

    scaleSize = 7
    octaveSpan = 1

    C4 D4 E4 F4 G4 A4 B4 C5
    B4 A4 G4 F4 E4 D4

    = 14 posiciones


    octaveSpan = 2

    C4 ... B4
    C5 ... B5
    C6
    B5 ... C5
    B4 ... D4

    = 28 posiciones
*/

export function createTonalCyclePositions(
    scaleSize: number,
    octaveSpan: number
): TonalCyclePosition[] {

    if (
        scaleSize <= 0 ||
        octaveSpan <= 0
    ) {
        return []
    }


    const ascending:
        TonalCyclePosition[] = []


    /*
        Construimos la subida.

        Para dos octavas:

        C4 D4 ... B4
        C5 D5 ... B5
    */

    for (
        let octave = 0;
        octave < octaveSpan;
        octave++
    ) {

        for (
            let degree = 0;
            degree < scaleSize;
            degree++
        ) {

            ascending.push({
                degree,
                octaveOffset:
                    octave
            })
        }
    }


    /*
        Añadimos la raíz superior.

        span 1 → C5
        span 2 → C6
        span 3 → C7
    */

    ascending.push({
        degree: 0,
        octaveOffset:
            octaveSpan
    })


    /*
        Reflejamos la subida,
        sin duplicar:

        - la raíz inicial
        - la raíz superior

        C4 ... C5

        →

        C4 ... C5 ... D4
    */

    const descending =
        ascending
            .slice(
                1,
                -1
            )
            .reverse()


    return [
        ...ascending,
        ...descending
    ]
}


/*
    Devuelve todos los divisores
    exactos de una base.

    14 →
    [1, 2, 7, 14]

    28 →
    [1, 2, 4, 7, 14, 28]
*/

export function getDivisors(
    value: number
): number[] {

    const divisors:
        number[] = []


    for (
        let candidate = 1;
        candidate <= value;
        candidate++
    ) {

        if (
            value %
                candidate ===
            0
        ) {

            divisors.push(
                candidate
            )
        }
    }


    return divisors
}


/*
    DIVIDE

    Divide el círculo solamente
    cuando la división es exacta.

    BASE 28
    DIVIDE 4

    spacing = 7

    0 → 7 → 14 → 21
*/

export function getDivideTraversal(
    totalPositions: number,
    divisions: number,
    rotation = 0
): number[] {

    if (
        totalPositions <= 0 ||
        divisions <= 0
    ) {
        return []
    }


    const safeDivisions =
        Math.round(
            divisions
        )


    /*
        No permitimos aproximaciones.

        Ejemplo:

        14 / 5

        no forma una división
        discreta exacta.
    */

    if (
        totalPositions %
            safeDivisions !==
        0
    ) {
        return []
    }


    const spacing =
        totalPositions /
        safeDivisions


    const normalizedRotation =
        (
            (
                rotation %
                    totalPositions
            ) +
            totalPositions
        ) %
        totalPositions


    return Array.from(
        {
            length:
                safeDivisions
        },

        (_, index) =>
            (
                normalizedRotation +
                index *
                    spacing
            ) %
            totalPositions
    )
}


/*
    STEP

    Recorremos el grupo modular:

    x(n+1) =
        x(n) + step mod N


    BASE 14
    STEP 5

    0
    5
    10
    1
    6
    11
    2
    ...
*/

export function getStepTraversal(
    totalPositions: number,
    step: number,
    rotation = 0
): number[] {

    if (
        totalPositions <= 0
    ) {
        return []
    }


    const safeStep =
        Math.max(
            1,
            Math.round(
                step
            )
        )


    const normalizedRotation =
        (
            (
                rotation %
                    totalPositions
            ) +
            totalPositions
        ) %
        totalPositions


    const visited =
        new Set<number>()


    const result:
        number[] = []


    let current =
        normalizedRotation


    while (
        !visited.has(
            current
        )
    ) {

        visited.add(
            current
        )


        result.push(
            current
        )


        current =
            (
                current +
                safeStep
            ) %
            totalPositions
    }


    return result
}


/*
    Operador general.

    DIVIDE:
        simetría exacta

    STEP:
        recorrido modular
*/

export function getTonalTraversal(
    mode: TonalTraversalMode,
    totalPositions: number,
    amount: number,
    rotation = 0
): number[] {

    if (
        mode === "divide"
    ) {

        return getDivideTraversal(
            totalPositions,
            amount,
            rotation
        )
    }


    return getStepTraversal(
        totalPositions,
        amount,
        rotation
    )
}