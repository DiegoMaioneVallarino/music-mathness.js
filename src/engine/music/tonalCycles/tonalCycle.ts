import type {
    TonalFigure
} from "../../patterns/types"


export type TonalCyclePosition = {
    degree: number
    octaveOffset: number
}


/*
    BASE TONAL

    Construye las posiciones reales
    de la escala incluyendo octavas
    y reflexión.

    Escala de 7 grados:

    octaveSpan = 1
    → 14 posiciones

    octaveSpan = 2
    → 28 posiciones
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
        Añadimos la raíz
        de la octava superior.

        Ejemplo:

        C4 D4 E4 F4 G4 A4 B4 C5
    */

    ascending.push({
        degree: 0,
        octaveOffset:
            octaveSpan
    })


    /*
        Reflejamos sin duplicar
        los extremos.

        C4 ... C5 B4 ... D4
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
    NORMALIZACIÓN MODULAR

    Convierte cualquier posición
    al rango:

    0 ... N - 1
*/

export function normalizePosition(
    position: number,
    totalPositions: number
): number {

    if (
        totalPositions <= 0
    ) {
        return 0
    }


    return (
        (
            position %
                totalPositions
        ) +
        totalPositions
    ) %
    totalPositions
}


/*
    CLOSE

    Calcula el salto positivo
    necesario para volver al origen.

    Ejemplo:

    BASE 7

    [2, 3, 3]

    suma = 8
    8 mod 7 = 1

    close = 6

    [2, 3, 3, 6]

    suma = 14
    14 mod 7 = 0
*/

export function getClosingStep(
    steps: number[],
    totalPositions: number
): number {

    if (
        totalPositions <= 0
    ) {
        return 0
    }


    const accumulated =
        steps.reduce(
            (
                sum,
                step
            ) =>
                sum +
                step,
            0
        )


    const remainder =
        normalizePosition(
            accumulated,
            totalPositions
        )


    /*
        Ya está cerrado.

        Preferimos una vuelta
        completa antes que STEP 0.
    */

    if (
        remainder === 0
    ) {
        return totalPositions
    }


    return (
        totalPositions -
        remainder
    )
}


/*
    PASOS REALES DE LA FIGURA

    REGULAR:
        un salto constante

    IRREGULAR:
        lista de saltos

    CLOSE:
        reemplaza automáticamente
        el último salto.
*/

export function getFigureSteps(
    figure: TonalFigure,
    totalPositions: number
): number[] {

    if (
        totalPositions <= 0
    ) {
        return []
    }


    /*
        REGULAR
    */

    if (
        figure.mode ===
        "regular"
    ) {

        const step =
            normalizePosition(
                figure.regularStep,
                totalPositions
            )


        /*
            Evitamos STEP 0.
        */

        return [
            step === 0
                ? totalPositions
                : step
        ]
    }


    /*
        IRREGULAR
    */

    if (
        figure.steps.length === 0
    ) {
        return []
    }


    /*
        Sin CLOSE:
        devolvemos la lista tal cual.
    */

    if (
        !figure.closeLastStep
    ) {

        return [
            ...figure.steps
        ]
    }


    /*
        El último elemento
        representa el slot CLOSE.

        Su valor manual se ignora.
    */

    const previousSteps =
        figure.steps.slice(
            0,
            -1
        )


    /*
        Si solo existe un slot
        y está marcado CLOSE,
        damos una vuelta completa.
    */

    if (
        previousSteps.length === 0
    ) {

        return [
            totalPositions
        ]
    }


    const closingStep =
        getClosingStep(
            previousSteps,
            totalPositions
        )


    return [
        ...previousSteps,
        closingStep
    ]
}


/*
    RECORRIDO REGULAR

    Repite el mismo salto
    hasta volver al punto inicial.

    BASE 14
    STEP 2:

    0
    2
    4
    6
    8
    10
    12
*/

function getRegularTraversal(
    figure: TonalFigure,
    totalPositions: number
): number[] {

    const steps =
        getFigureSteps(
            figure,
            totalPositions
        )


    if (
        steps.length === 0
    ) {
        return []
    }


    const step =
        steps[0]


    const start =
        normalizePosition(
            figure.rotation,
            totalPositions
        )


    const traversal:
        number[] = []


    let position =
        start


    /*
        Protección extra para
        evitar loops accidentales.
    */

    let safety =
        0


    const maxIterations =
        totalPositions * 2 +
        1


    do {

        traversal.push(
            position
        )


        position =
            normalizePosition(
                position +
                    step,
                totalPositions
            )


        safety++


    } while (
        position !== start &&
        safety <
            maxIterations
    )


    return traversal
}


/*
    RECORRIDO IRREGULAR

    Cada número de la lista
    es una arista.

    Ejemplo:

    BASE 14

    [1, 2, 4, 4, 2, 1]

    0
    1
    3
    7
    11
    13
    0
*/

function getIrregularTraversal(
    figure: TonalFigure,
    totalPositions: number
): number[] {

    const steps =
        getFigureSteps(
            figure,
            totalPositions
        )


    if (
        steps.length === 0
    ) {
        return []
    }


    const start =
        normalizePosition(
            figure.rotation,
            totalPositions
        )


    /*
        En modo irregular no basta
        con recordar la posición.

        También tenemos que recordar
        qué step toca ejecutar.

        Estado:

        posición + stepIndex

        Ejemplo:

        posición 0
        esperando step 0

        solo cuando volvamos exactamente
        a ese mismo estado hemos cerrado
        el verdadero ciclo.
    */

    const traversal: number[] = []


    const visitedStates =
        new Set<string>()


    let position =
        start


    let stepIndex =
        0


    while (true) {

        const stateKey =
            `${position}:${stepIndex}`


        /*
            Ya estuvimos exactamente aquí
            con exactamente el mismo
            siguiente salto.

            Desde aquí todo se repetiría
            infinitamente.

            Hemos encontrado el loop.
        */

        if (
            visitedStates.has(
                stateKey
            )
        ) {
            break
        }


        visitedStates.add(
            stateKey
        )


        traversal.push(
            position
        )


        /*
            Ejecutamos el salto actual.
        */

        const step =
            steps[
                stepIndex
            ]


        position =
            normalizePosition(
                position + step,
                totalPositions
            )


        /*
            Cuando llegamos al final
            de la lista:

            2, 3, 3, 2
                     ↓

            volvemos al primer 2.

            2, 3, 3, 2,
            2, 3, 3, 2,
            ...
        */

        stepIndex =
            (
                stepIndex + 1
            ) %
            steps.length
    }


    return traversal
}


/*
    FUNCIÓN GENERAL

    Toda la aplicación debería
    pedir el recorrido por aquí.
*/

export function getFigureTraversal(
    figure: TonalFigure,
    totalPositions: number
): number[] {

    if (
        totalPositions <= 0
    ) {
        return []
    }


    if (
        figure.mode ===
        "regular"
    ) {

        return getRegularTraversal(
            figure,
            totalPositions
        )
    }


    return getIrregularTraversal(
        figure,
        totalPositions
    )
}


/*
    CANTIDAD DE STEPS

    No es necesariamente igual
    al número de posiciones distintas.

    REGULAR:
        cantidad de saltos necesarios
        para regresar al inicio.

    IRREGULAR:
        longitud del programa.
*/

export function getFigureStepCount(
    figure: TonalFigure,
    totalPositions: number
): number {

    return getFigureTraversal(
        figure,
        totalPositions
    ).length
}


/*
    DISTANCIA TOTAL RECORRIDA

    Es la suma absoluta modular
    de todos los saltos ejecutados.

    Por ahora trabajamos solamente
    con saltos positivos.
*/

export function getFigureDistance(
    figure: TonalFigure,
    totalPositions: number
): number {

    if (
        totalPositions <= 0
    ) {
        return 0
    }


    const steps =
        getFigureSteps(
            figure,
            totalPositions
        )


    if (
        steps.length === 0
    ) {
        return 0
    }


    const traversal =
        getFigureTraversal(
            figure,
            totalPositions
        )


    let distance =
        0


    for (
        let index = 0;
        index < traversal.length;
        index++
    ) {

        const step =
            steps[
                index %
                steps.length
            ]


        distance +=
            step
    }


    return distance
}


/*
    VUELTAS SOBRE EL MÓDULO

    BASE 14
    distancia 28

    → 2 vueltas

    Puede devolver decimales
    si la figura irregular
    queda abierta.
*/

export function getFigureTurns(
    figure: TonalFigure,
    totalPositions: number
): number {

    if (
        totalPositions <= 0
    ) {
        return 0
    }


    return (
        getFigureDistance(
            figure,
            totalPositions
        ) /
        totalPositions
    )
}


/*
    ¿LA FIGURA TERMINA
    EN EL MISMO PUNTO
    DONDE COMENZÓ?
*/

export function isFigureClosed(
    figure: TonalFigure,
    totalPositions: number
): boolean {

    if (
        totalPositions <= 0
    ) {
        return false
    }


    /*
        Las regulares de nuestro
        sistema siempre se recorren
        hasta cerrar.
    */

    if (
        figure.mode ===
        "regular"
    ) {
        return true
    }


    const steps =
        getFigureSteps(
            figure,
            totalPositions
        )


    if (
        steps.length === 0
    ) {
        return false
    }


    const total =
        steps.reduce(
            (
                sum,
                step
            ) =>
                sum +
                step,
            0
        )


    return (
        normalizePosition(
            total,
            totalPositions
        ) === 0
    )
}


/*
    CUÁNTAS POSICIONES DIFERENTES
    TOCA LA FIGURA.
*/

export function getUniquePositionCount(
    figure: TonalFigure,
    totalPositions: number
): number {

    const traversal =
        getFigureTraversal(
            figure,
            totalPositions
        )


    return new Set(
        traversal
    ).size
}