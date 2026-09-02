export type Sample = {
    id: string
    name: string
    url: string
}


export const DEFAULT_SAMPLES: Sample[] = [
    {
        id: "kick_01",
        name: "kick.wav",
        url: "/samples/kick.wav"
    },
    {
        id: "snare_01",
        name: "snare.wav",
        url: "/samples/snare.wav"
    },
    {
        id: "hat_01",
        name: "hat.wav",
        url: "/samples/hat.wav"
    }
]