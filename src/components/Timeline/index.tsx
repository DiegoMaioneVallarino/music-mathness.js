import type {
    Pattern
} from "../../engine/patterns/types"

import type {
    TimelineTrack
} from "../../engine/timeline/types"

import "./styles.css"


type TimelineProps = {

    tracks: TimelineTrack[]

    patterns: Pattern[]

    onPlacePattern: (
        trackId: string,
        startBeat: number
    ) => void
}


export default function Timeline({
    tracks,
    patterns,
    onPlacePattern
}: TimelineProps) {

    const TOTAL_BEATS = 32


    return (
        <section className="timeline">

            <header className="timeline__header">

                <span>
                    TIMELINE
                </span>

                <div className="timeline__numbers">

                    {Array.from({
                        length: 8
                    }).map((_, index) => (

                        <span key={index}>
                            {index + 1}
                        </span>

                    ))}

                </div>

            </header>


            {tracks.map(
                track => (

                    <div
                        className="timeline-track"
                        key={track.id}
                    >

                        <div className="timeline-track__name">
                            {track.name}
                        </div>


                        <div className="timeline-track__lane">

                            {Array.from({
                                length: TOTAL_BEATS
                            }).map((_, beat) => (

                                <button
                                    key={beat}

                                    className="timeline-cell"

                                    onClick={() =>
                                        onPlacePattern(
                                            track.id,
                                            beat
                                        )
                                    }
                                />

                            ))}


                            {track.clips.map(
                                clip => {

                                    const pattern =
                                        patterns.find(
                                            pattern =>
                                                pattern.id ===
                                                clip.patternId
                                        )


                                    if (!pattern) {
                                        return null
                                    }


                                    return (
                                        <div
                                            key={clip.id}

                                            className={[
                                                "timeline-clip",

                                                pattern.type === "piano"
                                                    ? "timeline-clip--piano"
                                                    : "timeline-clip--step"

                                            ].join(" ")}

                                            style={{
                                                left:
                                                    `${clip.startBeat * 25}px`,

                                                width:
                                                    `${clip.lengthBeats * 25}px`
                                            }}
                                        >

                                            {pattern.name}

                                        </div>
                                    )
                                }
                            )}

                        </div>

                    </div>

                )
            )}

        </section>
    )
}