import type {
    TimelineTrack
} from "./types"


export function placePattern(
    track: TimelineTrack,
    patternId: string,
    startBeat: number,
    lengthBeats: number
): TimelineTrack {

    return {
        ...track,

        clips: [
            ...track.clips,

            {
                id: crypto.randomUUID(),

                patternId,

                startBeat,

                lengthBeats
            }
        ]
    }
}