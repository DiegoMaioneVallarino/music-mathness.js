export function getStepDurationMs(
    bpm: number,
    resolution: number
): number {

    const beatDurationMs =
        (60 / bpm) * 1000

    return beatDurationMs * resolution
}