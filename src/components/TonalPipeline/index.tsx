import "./styles.css"


export type TonalPipelineStage =
    "base" |
    "selection" |
    "combination"


type Props = {
    activeStage:
        TonalPipelineStage

    onStageChange:
        (
            stage:
                TonalPipelineStage
        ) => void
}


function TonalPipeline({
    activeStage,
    onStageChange
}: Props) {

    const stages:
        {
            id: TonalPipelineStage
            label: string
            number: number
        }[] = [

            {
                id: "base",
                label: "Tonal base",
                number: 1
            },

            {
                id: "selection",
                label: "Tonal selection",
                number: 2
            },

            {
                id: "combination",
                label: "Tonal combination",
                number: 3
            }
        ]


    return (

        <div className="tonal-pipeline">

            {stages.map(
                (
                    stage,
                    index
                ) => (

                    <div
                        className="tonal-pipeline__stage-wrapper"
                        key={
                            stage.id
                        }
                    >

                        <button
                            className={
                                `
                                tonal-pipeline__stage
                                tonal-pipeline__stage--${stage.id}
                                ${
                                    activeStage ===
                                    stage.id

                                        ? "tonal-pipeline__stage--active"
                                        : ""
                                }
                                `
                            }

                            onClick={() =>
                                onStageChange(
                                    stage.id
                                )
                            }
                        >

                            <span
                                className="tonal-pipeline__number"
                            >
                                {
                                    stage.number
                                }
                            </span>


                            <span
                                className="tonal-pipeline__label"
                            >
                                {
                                    stage.label
                                }
                            </span>

                        </button>


                        {
                            index <
                            stages.length - 1
                                ? (

                                    <div
                                        className="tonal-pipeline__connector"
                                    />

                                )
                                : null
                        }

                    </div>

                )
            )}

        </div>
    )
}


export default TonalPipeline