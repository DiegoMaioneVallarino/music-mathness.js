import type {
    StepPattern
} from "../../engine/patterns/types"

import "./styles.css"


type PatternGridProps = {

    pattern: StepPattern

    currentStep: number | null

    onToggleStep: (
        layerId: string,
        stepIndex: number
    ) => void
}



export default function PatternGrid({
    pattern,
    currentStep,
    onToggleStep
}: PatternGridProps) {

    return (
        <section className="pattern-grid">

            <header className="pattern-grid__header">
                <span>
                    {pattern.name}
                </span>

                <span>
                    {pattern.bars} BAR
                </span>
            </header>
        <div className="pattern-grid__beats">

            <div />

            <div className="pattern-grid__beat-labels">
                {pattern.layers[0]?.steps.map((_, index) => (
                    <span key={index}>
                        {index % 2 === 0
                            ? Math.floor(index / 2) + 1
                            : "&"}
                    </span>
                ))}
            </div>

        </div>

            <div className="pattern-grid__body">

                {pattern.layers.map((layer) => (

                    <div
                        className="pattern-layer"
                        key={layer.id}
                    >

                        <div className="pattern-layer__name">
                            {layer.name}
                        </div>


                        <div className="pattern-layer__steps">

                            {layer.steps.map((step, index) => (

                                <button
                                key={index}

                                className={[
                                    "step",

                                    step === 1
                                        ? "step--active"
                                        : "",

                                    currentStep === index
                                        ? "step--playing"
                                        : ""

                                ].join(" ")}

                                onClick={() =>
                                    onToggleStep(
                                        layer.id,
                                        index
                                    )
                                }
                            />

                            ))}

                        </div>

                    </div>

                ))}

            </div>

        </section>
    )
}