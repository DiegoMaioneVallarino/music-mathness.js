export type TimelineClip = {
    id: string

    patternId: string

    startBeat: number

    lengthBeats: number
}


export type TimelineTrack = {
    id: string

    name: string

    clips: TimelineClip[]
}