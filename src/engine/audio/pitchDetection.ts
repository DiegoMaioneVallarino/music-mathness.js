export type PitchDetectionResult = {
    frequency: number
    midi: number
    noteName: string
    confidence: number
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


function frequencyToMidi(
    frequency: number
): number {

    return (
        69 +
        12 *
        Math.log2(
            frequency / 440
        )
    )
}


function midiToNoteName(
    midi: number
): string {

    const rounded =
        Math.round(midi)

    const noteIndex =
        (
            rounded % 12 +
            12
        ) % 12

    const octave =
        Math.floor(
            rounded / 12
        ) - 1

    return (
        NOTE_NAMES[noteIndex] +
        octave
    )
}


function calculateRms(
    samples: Float32Array
): number {

    let sum = 0

    for (
        let i = 0;
        i < samples.length;
        i++
    ) {

        const sample =
            samples[i]

        sum +=
            sample * sample
    }

    return Math.sqrt(
        sum /
        samples.length
    )
}


function autocorrelate(
    samples: Float32Array,
    sampleRate: number
): {
    frequency: number
    confidence: number
} | null {

    const rms =
        calculateRms(
            samples
        )


    /*
        Si el audio es prácticamente
        silencio, no intentamos detectar
        ninguna nota.
    */

    if (
        rms < 0.01
    ) {
        return null
    }


    /*
        Rango de frecuencias
        que queremos analizar.

        40 Hz   ≈ E1
        2000 Hz ≈ B6
    */

    const minFrequency =
        40

    const maxFrequency =
        2000


    /*
        Convertimos frecuencia
        a desplazamiento temporal.

        lag =
            sampleRate /
            frequency
    */

    const minLag =
        Math.floor(
            sampleRate /
            maxFrequency
        )

    const maxLag =
        Math.min(
            Math.floor(
                sampleRate /
                minFrequency
            ),
            samples.length - 2
        )


    /*
        Guardaremos la correlación
        de cada lag.

        Después podremos buscar
        picos locales.
    */

    const correlations:
        number[] = []


    for (
        let lag = minLag;
        lag <= maxLag;
        lag++
    ) {

        let correlation =
            0

        let energyA =
            0

        let energyB =
            0


        const limit =
            samples.length -
            lag


        for (
            let i = 0;
            i < limit;
            i++
        ) {

            const a =
                samples[i]

            const b =
                samples[
                    i + lag
                ]


            correlation +=
                a * b


            energyA +=
                a * a


            energyB +=
                b * b
        }


        const denominator =
            Math.sqrt(
                energyA *
                energyB
            )


        if (
            denominator === 0
        ) {

            correlations[
                lag
            ] = 0

            continue
        }


        const normalized =
            correlation /
            denominator


        correlations[
            lag
        ] =
            normalized
    }


    /*
        En vez de buscar solamente
        la correlación MÁS GRANDE,
        buscamos el primer pico local
        suficientemente fuerte.

        Esto evita muchos casos donde
        terminábamos encontrando:

        T
        2T
        3T
        4T

        y por lo tanto una frecuencia
        artificialmente demasiado baja.
    */

    let bestLag =
        -1

    let bestCorrelation =
        0


    const strongPeakThreshold =
        0.75


    for (
        let lag =
            minLag + 1;

        lag <
            maxLag;

        lag++
    ) {

        const previous =
            correlations[
                lag - 1
            ] ?? 0

        const current =
            correlations[
                lag
            ] ?? 0

        const next =
            correlations[
                lag + 1
            ] ?? 0


        const isPeak =
            current >
                previous &&
            current >=
                next


        if (
            isPeak &&
            current >=
                strongPeakThreshold
        ) {

            bestLag =
                lag

            bestCorrelation =
                current

            break
        }
    }


    /*
        Si no encontramos ningún
        pico suficientemente fuerte,
        hacemos fallback al mejor
        pico disponible.

        Así no hacemos que el detector
        falle completamente con samples
        un poco más complejos.
    */

    if (
        bestLag <= 0
    ) {

        for (
            let lag = minLag;
            lag <= maxLag;
            lag++
        ) {

            const current =
                correlations[
                    lag
                ] ?? 0


            if (
                current >
                bestCorrelation
            ) {

                bestCorrelation =
                    current

                bestLag =
                    lag
            }
        }
    }


    if (
        bestLag <= 0
    ) {
        return null
    }


    const frequency =
        sampleRate /
        bestLag


    return {
        frequency,

        confidence:
            Math.max(
                0,
                Math.min(
                    1,
                    bestCorrelation
                )
            )
    }
}


export function detectPitch(
    audioBuffer: AudioBuffer
): PitchDetectionResult | null {

    if (
        audioBuffer.length === 0
    ) {
        return null
    }


    /*
        Por ahora analizamos
        solamente el canal 0.
    */

    const channel =
        audioBuffer.getChannelData(
            0
        )


    /*
        Saltamos ligeramente el inicio.

        El ataque inicial de algunos
        instrumentos puede ser muy
        ruidoso y confundir el detector.
    */

    const start =
        Math.min(
            Math.floor(
                audioBuffer.sampleRate *
                0.05
            ),
            channel.length - 1
        )


    /*
        Analizamos 250 ms.

        Es suficiente para muchos
        samples tonales cortos.
    */

    const analysisLength =
        Math.min(
            Math.floor(
                audioBuffer.sampleRate *
                0.25
            ),
            channel.length -
            start
        )


    if (
        analysisLength <= 0
    ) {
        return null
    }


    const samples =
        channel.slice(
            start,
            start +
            analysisLength
        )


    const result =
        autocorrelate(
            samples,
            audioBuffer.sampleRate
        )


    if (
        !result
    ) {
        return null
    }


    const rawMidi =
        frequencyToMidi(
            result.frequency
        )


    const midi =
        Math.round(
            rawMidi
        )


    return {
        frequency:
            result.frequency,

        midi,

        noteName:
            midiToNoteName(
                midi
            ),

        confidence:
            result.confidence
    }
}